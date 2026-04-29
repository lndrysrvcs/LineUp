using Google.OrTools.Sat;
using LineUp.Core.Models;
using LineUp.Core.Models.Forms;

namespace LineUp.Scheduler;

/// <summary>
/// The main class for scheduling shifts.
/// </summary>
public static class Scheduler
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
        SchedulePreferences preferences,
        bool random = false
    )
    {
        var cpsatModel = new CpModel();
        var shiftsPerDay = AvailabilityMatrixTools.SlotsPerDay(schedule);
        if (shiftsPerDay <= 0)
        {
            throw new Exception("Schedule has zero or negative slots per day.");
        }

        List<Availability> allAvailabilities = GenerateAvailabilitiesWithSystemUser(
            schedule,
            availabilities
        );

        // ALWAYS GO BY THIS OR YOU WILL LOSE TRACK OF THINGS
        Dictionary<Guid, int> availabilityIndices =
            AvailabilityMatrixTools.GenerateAvailabilityGuidPointerHashSet(allAvailabilities);
        Dictionary<TimeOnly, int> timeIndices =
            AvailabilityMatrixTools.GenerateMatrixTimePointerHashSet(schedule);

        // generate matrices from users' availabilities
        Dictionary<Guid, int[,]> availabilityMatrices = PrepareAvailabilityMatrices(
            schedule,
            allAvailabilities,
            timeIndices
        );

        var allShifts = Enumerable.Range(0, shiftsPerDay).ToArray();

        var solverAvailabilityMatrix = PrepareSolverAvailabilityMatrix(
            schedule,
            allAvailabilities,
            shiftsPerDay,
            availabilityIndices,
            availabilityMatrices
        );

        Dictionary<Tuple<Guid, DateOnly, int>, IntVar> shifts = InitializeDecisionVariables(
            cpsatModel,
            allAvailabilities,
            schedule.DateCoverage,
            allShifts
        );

        ApplyConstraints(
            cpsatModel,
            allAvailabilities,
            schedule.DateCoverage,
            allShifts,
            shifts,
            preferences,
            availabilityIndices,
            solverAvailabilityMatrix,
            schedule.SchedulePreferences.MinutesPerSlot
        );

        ApplyObjective(
            cpsatModel,
            allAvailabilities,
            schedule.DateCoverage,
            allShifts,
            shifts,
            availabilityIndices,
            solverAvailabilityMatrix,
            random
        );

        var solver = new CpSolver();
        if (random)
        {
            solver.StringParameters = $"random_seed:{new Random().Next()}";
        }
        var status = solver.Solve(cpsatModel);
        Console.WriteLine($"Solve status: {status}");

        if (status is not (CpSolverStatus.Optimal or CpSolverStatus.Feasible))
        {
            throw new Exception("Solver did not find an optimal solution");
        }

        List<ShiftAssignment> assignments = ConvertToAssignments(
            solver,
            shifts,
            allAvailabilities,
            schedule
        );

        return new SolverResult { Status = status, Assignments = assignments };
    }

    public static List<Availability> GenerateAvailabilitiesWithSystemUser(
        Schedule schedule,
        IEnumerable<Availability> availabilities
    )
    {
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
        return availabilities.Append(systemUser).ToList();
    }

    private static Dictionary<Guid, int[,]> PrepareAvailabilityMatrices(
        Schedule schedule,
        IEnumerable<Availability> availabilities,
        Dictionary<TimeOnly, int> timeIndices
    )
    {
        Dictionary<Guid, int[,]> availabilityMatrices = new();
        var template = AvailabilityMatrixTools.GenerateEmptyMatrixFromSchedule(schedule);

        foreach (var a in availabilities)
        {
            var output = (int[,])template.Clone();
            foreach (var slot in a.AvailabilitySlots)
            {
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

        return availabilityMatrices;
    }

    private static int[,,] PrepareSolverAvailabilityMatrix(
        Schedule schedule,
        List<Availability> availabilities,
        int shiftsPerDay,
        Dictionary<Guid, int> availabilityIndices,
        Dictionary<Guid, int[,]> availabilityMatrices
    )
    {
        var solverAvailabilityMatrix = new int[
            availabilities.Count,
            schedule.DateCoverage.Length,
            shiftsPerDay
        ];

        foreach (var a in availabilities)
        {
            var index = availabilityIndices[a.Guid];
            var matrix = availabilityMatrices[a.Guid];

            for (var i = 0; i < schedule.DateCoverage.Length; i++)
            {
                for (var j = 0; j < shiftsPerDay; j++)
                {
                    solverAvailabilityMatrix[index, i, j] = matrix[i, j];
                }
            }
        }

        return solverAvailabilityMatrix;
    }

    private static Dictionary<Tuple<Guid, DateOnly, int>, IntVar> InitializeDecisionVariables(
        CpModel model,
        IEnumerable<Availability> availabilities,
        DateOnly[] dateCoverage,
        int[] allShifts
    )
    {
        Dictionary<Tuple<Guid, DateOnly, int>, IntVar> shifts = new();
        foreach (var availability in availabilities)
        {
            foreach (var date in dateCoverage)
            {
                foreach (var shift in allShifts)
                {
                    shifts.Add(
                        Tuple.Create(availability.Guid, date, shift),
                        model.NewBoolVar($"shift_{availability.Guid}_{date}_{shift}")
                    );
                }
            }
        }
        return shifts;
    }

    private static void ApplyConstraints(
        CpModel model,
        List<Availability> availabilities,
        DateOnly[] dateCoverage,
        int[] allShifts,
        Dictionary<Tuple<Guid, DateOnly, int>, IntVar> shifts,
        SchedulePreferences preferences,
        Dictionary<Guid, int> availabilityIndices,
        int[,,] solverAvailabilityMatrix,
        int minutesPerSlot
    )
    {
        // Each shift should have only UsersPerShift workers
        foreach (var d in dateCoverage)
        {
            foreach (var s in allShifts)
            {
                IntVar[] x = new IntVar[availabilities.Count];

                for (var i = 0; i < availabilities.Count; i++)
                {
                    var a = availabilities[i].Guid;
                    Tuple<Guid, DateOnly, int> key = Tuple.Create(a, d, s);
                    x[i] = shifts[key];
                }

                model.Add(LinearExpr.Sum(x) <= preferences.UsersPerShift);
            }
        }

        // Users can only be assigned to slots where they're available
        // Enforce max shifts per worker, continuity, and max duration
        foreach (var a in availabilities)
        {
            if (a.Guid == Guid.AllBitsSet)
            {
                // System user is always available and has no preferences
                continue;
            }

            List<IntVar> userAllShifts = new();

            foreach (var d in dateCoverage)
            {
                var dateIndex = Array.IndexOf(dateCoverage, d);
                List<IntVar> userDayShifts = new();

                foreach (var s in allShifts)
                {
                    var shiftVar = shifts[Tuple.Create(a.Guid, d, s)];
                    userAllShifts.Add(shiftVar);
                    userDayShifts.Add(shiftVar);

                    if (solverAvailabilityMatrix[availabilityIndices[a.Guid], dateIndex, s] == 0)
                    {
                        model.Add(shiftVar == 0);
                    }
                }

                // Continuity and MaximumShiftDurationMinutes per day
                // To enforce at most ONE continuous block:
                // Let works[t] be the decision variable for slot t.
                // Let starts[t] be true if works[t] and NOT works[t-1].
                // Sum(starts[t]) <= 1 ensures at most one block.
                if (userDayShifts.Count > 0)
                {
                    List<IntVar> starts = new();
                    for (int s = 0; s < userDayShifts.Count; s++)
                    {
                        var start = model.NewBoolVar($"{a.Guid}_{d}_starts_{s}");
                        starts.Add(start);
                        if (s == 0)
                        {
                            // start[0] iff userDayShifts[0]
                            model.Add(start == userDayShifts[0]);
                        }
                        else
                        {
                            // start[s] iff userDayShifts[s] AND NOT userDayShifts[s-1]
                            // This is start[s] >= userDayShifts[s] - userDayShifts[s-1]
                            // AND start[s] <= userDayShifts[s]
                            // AND start[s] <= 1 - userDayShifts[s-1]
                            model.Add(start >= userDayShifts[s] - userDayShifts[s - 1]);
                        }
                    }
                    model.Add(LinearExpr.Sum(starts) <= 1);

                    // Max duration per continuous block (which is now only one block)
                    if (preferences.MaximumShiftDurationMinutes > 0)
                    {
                        int maxSlots = preferences.MaximumShiftDurationMinutes / minutesPerSlot;
                        model.Add(LinearExpr.Sum(userDayShifts) <= maxSlots);
                    }
                }
            }

            // MaximumShiftsPerWorker (total across all days)
            if (preferences.MaximumShiftsPerWorker > 0)
            {
                model.Add(LinearExpr.Sum(userAllShifts) <= preferences.MaximumShiftsPerWorker);
            }
        }
    }

    private static void ApplyObjective(
        CpModel model,
        IEnumerable<Availability> availabilities,
        DateOnly[] dateCoverage,
        int[] allShifts,
        Dictionary<Tuple<Guid, DateOnly, int>, IntVar> shifts,
        Dictionary<Guid, int> availabilityIndices,
        int[,,] solverAvailabilityMatrix,
        bool random
    )
    {
        List<IntVar> flatShifts = new();
        List<long> flatShiftRequests = new();
        Random? rng = random ? new Random() : null;

        foreach (var a in availabilities)
        {
            foreach (var d in dateCoverage)
            {
                var dateIndex = Array.IndexOf(dateCoverage, d);
                foreach (var s in allShifts)
                {
                    flatShifts.Add(shifts[Tuple.Create(a.Guid, d, s)]);
                    long weight;
                    if (a.Guid == Guid.AllBitsSet)
                    {
                        // penalize system user assignments
                        // use a large negative weight to ensure real users are always preferred
                        weight = -10000;
                    }
                    else
                    {
                        // passthrough existing weight if not system user
                        // usually this is 1 for available, 0 for unavailable (though unavailable is already constrained to 0)
                        weight =
                            solverAvailabilityMatrix[availabilityIndices[a.Guid], dateIndex, s]
                            * 100;
                    }

                    if (rng != null)
                    {
                        // add a small random weight to break ties
                        weight += rng.Next(1, 10);
                    }
                    flatShiftRequests.Add(weight);
                }
            }
        }

        model.Maximize(LinearExpr.WeightedSum(flatShifts, flatShiftRequests));
    }

    private static List<ShiftAssignment> ConvertToAssignments(
        CpSolver solver,
        Dictionary<Tuple<Guid, DateOnly, int>, IntVar> shifts,
        List<Availability> availabilities,
        Schedule schedule
    )
    {
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
                    ScheduleId = schedule.Id,
                }
            );
        }

        return assignments;
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
