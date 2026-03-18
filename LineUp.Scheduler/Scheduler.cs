using Google.OrTools.Sat;
using LineUp.Core.Models;
using LineUp.Core.Models.Forms;

namespace LineUp.Scheduler;

public class Scheduler
{
    /// <summary>
    /// Runs the scheduler.
    /// </summary>
    /// <param name="schedule"></param>
    /// <param name="availabilities"></param>
    /// <param name="preferences"></param>
    /// <exception cref="Exception"></exception>
    public static SolverResult RunScheduler(
        Schedule schedule,
        IEnumerable<Availability> availabilities,
        SchedulePreferences preferences
    )
    {
        var cpsatModel = new CpModel();
        var shiftsPerDay = AvailabilityMatrixTools.SlotsPerDay(schedule);

        // generate placeholder "system" user to inject into the scheduler to take the shift
        var systemUser = new Availability
        {
            Guid = Guid.AllBitsSet,
            UserName = "System",
            UserEmail = "system@lineup.com",
            AvailabilitySlots = GenerateSystemAvailabilitySlots(schedule),
            Schedule = schedule,
            Preferences = new AvailabilityPreferences(),
            FormAnswers = new List<FormQuestionAnswer>(),
        };
        availabilities = availabilities.Append(systemUser);

        availabilities = availabilities.ToList(); // hack to not do multiple enumeration

        // ALWAYS GO BY THIS OR YOU WILL LOSE TRACK OF THINGS
        Dictionary<Guid, int> availabilityIndices =
            AvailabilityMatrixTools.GenerateAvailabilityGuidPointerHashSet(availabilities);
        Dictionary<TimeOnly, int> timeIndices =
            AvailabilityMatrixTools.GenerateMatrixTimePointerHashSet(schedule);

        // generate matrices from users' availabilities
        Dictionary<Guid, int[,]> availabilityMatrices = new();
        var template = AvailabilityMatrixTools.GenerateEmptyMatrixFromSchedule(schedule);

        foreach (var a in availabilities)
        {
            var output = (int[,])template.Clone(); // cast to satisfy compiler
            foreach (var slot in a.AvailabilitySlots)
            {
                // find index for date from DateCoverage
                var index = Array.IndexOf(schedule.DateCoverage, DateOnly.FromDateTime(slot));
                if (index == -1)
                {
                    throw new Exception("Availability slot is not in schedule date coverage!");
                }
                if (!timeIndices.TryGetValue(TimeOnly.FromDateTime(slot), out var timeIndex))
                {
                    throw new Exception("Availability slot time is not in schedule time indices!");
                }
                output[index, timeIndex] = 1;
            }
            availabilityMatrices[a.Guid] = output;
        }

        var allShifts = Enumerable.Range(0, shiftsPerDay).ToArray();

        Dictionary<Tuple<Guid, DateOnly, int>, IntVar> shifts = new();
        var solverAvailabilityMatrix = new int[
            availabilities.Count(),
            schedule.DateCoverage.Length,
            shiftsPerDay
        ];

        // Assemble availability matrix
        foreach (var a in availabilities)
        {
            var index = availabilityIndices[a.Guid];
            var matrix = availabilityMatrices[a.Guid];

            for (int i = 0; i < schedule.DateCoverage.Length; i++)
            {
                for (int j = 0; j < shiftsPerDay; j++)
                {
                    solverAvailabilityMatrix[index, i, j] = matrix[i, j];
                }
            }
        }

        // define decision variables so we can reverse out the things later
        foreach (var availability in availabilities)
        {
            foreach (var date in schedule.DateCoverage)
            {
                foreach (var shift in allShifts)
                {
                    shifts.Add(
                        Tuple.Create(availability.Guid, date, shift),
                        cpsatModel.NewBoolVar($"shift_{availability.Guid}_{date}_{shift}")
                    );
                }
            }
        }

        // constraint: each shift should have only UsersPerShift workers
        foreach (var d in schedule.DateCoverage)
        {
            foreach (var s in allShifts)
            {
                IntVar[] x = new IntVar[availabilities.Count()];

                for (var i = 0; i < availabilities.Count(); i++)
                {
                    var a = availabilities.ElementAt(i).Guid;
                    Tuple<Guid, DateOnly, int> key = Tuple.Create(a, d, s);

                    x[i] = shifts[key];
                }
                cpsatModel.Add(LinearExpr.Sum(x) == preferences.UsersPerShift);
            }
        }

        // constraint: users can only be assigned to slots where they're available
        foreach (var a in availabilities)
        {
            foreach (var d in schedule.DateCoverage)
            {
                foreach (var s in allShifts)
                {
                    if (a.Guid == Guid.AllBitsSet)
                    {
                        // System user is always available
                        continue;
                    }

                    if (
                        solverAvailabilityMatrix[
                            availabilityIndices[a.Guid],
                            schedule.DateCoverage.IndexOf(d),
                            s
                        ] == 0
                    )
                    {
                        cpsatModel.Add(shifts[Tuple.Create(a.Guid, d, s)] == 0);
                    }
                }
            }
        }

        // objective: maximize people being assigned to shifts they requested
        // AND penalize the system user being assigned to a shift
        List<IntVar> flatShifts = new();
        List<int> flatShiftRequests = new();

        foreach (var a in availabilities)
        {
            foreach (var d in schedule.DateCoverage)
            {
                foreach (var s in allShifts)
                {
                    flatShifts.Add(shifts[Tuple.Create(a.Guid, d, s)]);
                    if (a.Guid == Guid.AllBitsSet)
                    {
                        // penalize system user assignments
                        flatShiftRequests.Add(-1);
                    }
                    else
                    {
                        // passthrough existing weight if not system user
                        flatShiftRequests.Add(
                            solverAvailabilityMatrix[
                                availabilityIndices[a.Guid],
                                schedule.DateCoverage.IndexOf(d),
                                s
                            ]
                        );
                    }
                }
            }
        }

        cpsatModel.Maximize(LinearExpr.WeightedSum(flatShifts, flatShiftRequests));

        // todo: honor max shift per worker
        // todo: honor max shift length
        var solver = new CpSolver();
        var status = solver.Solve(cpsatModel);
        Console.WriteLine($"Solve status: {status}");

        if (status is not (CpSolverStatus.Optimal or CpSolverStatus.Feasible))
        {
            throw new Exception("Solver did not find an optimal solution");
        }

        // solver successful, let's convert back to ShiftAssignment objects
        List<ShiftAssignment> assignments = [];

        foreach (var ((guid, date, shiftIndex), var) in shifts)
        {
            if (solver.Value(var) != 1)
                continue;
            var availability = availabilities.First(a => a.Guid == guid);

            // skip the system user
            if (availability.Guid == Guid.AllBitsSet)
            {
                continue;
            }

            var startTime = new DateTime(
                date.Year,
                date.Month,
                date.Day,
                schedule.StartTime.Hour,
                schedule.StartTime.Minute,
                0,
                DateTimeKind.Utc
            ).AddMinutes(shiftIndex * schedule.SchedulePreferences.MinutesPerSlot);

            var endTime = startTime.AddMinutes(schedule.SchedulePreferences.MinutesPerSlot);

            assignments.Add(
                new ShiftAssignment
                {
                    StartTime = startTime,
                    EndTime = endTime,
                    Availability = availability,
                }
            );
        }

        return new SolverResult { Status = status, Assignments = assignments };
    }

    private static DateTime[] GenerateSystemAvailabilitySlots(Schedule schedule)
    {
        List<DateTime> output = [];

        foreach (var date in schedule.DateCoverage)
        {
            for (var i = 0; i < AvailabilityMatrixTools.SlotsPerDay(schedule); i++)
            {
                output.Add(
                    new DateTime(
                        date.Year,
                        date.Month,
                        date.Day,
                        schedule.StartTime.Hour,
                        schedule.StartTime.Minute,
                        0,
                        DateTimeKind.Utc
                    ).AddMinutes(i * schedule.SchedulePreferences.MinutesPerSlot)
                );
            }
        }

        return output.ToArray();
    }

    public record SolverResult
    {
        public CpSolverStatus Status { get; init; }
        public List<ShiftAssignment>? Assignments { get; init; }
    }
}
