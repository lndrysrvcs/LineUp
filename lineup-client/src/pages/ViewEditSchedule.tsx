import type { TimeRange, ValidMinutes } from "@/types";
//import { useAuth0 } from "@auth0/auth0-react";
import { Calendar } from "@/components/Calendar";
import { ColoredCell } from "@/components/CalendarCells";
import { MousePopup } from "@/components/MousePopup";
import { queryClient, useApi } from "@/utils/api";
import { addToasts, loaderQuery } from "@/utils/db";
import { parseTimeString } from "@/utils/time.ts";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { type MouseEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import "../dateinput.css";
import "./schedule.css";

interface ScheduleData {
  name: string; //the name of the event
  shiftTimes: ValidMinutes | "" | undefined; //how the availability intervals are determined
  dates: Date[] | undefined; //the dates being scheduled (js Date version)
  hours: TimeRange; //the hours throughout the day that need covered
  pplPerShift: number | undefined; //how many people should work simultaneously

  // optional parameters
  maxShiftLength: number | undefined; //maximum length of time a single person can work continuously, in minutes
  maxShifts: number | undefined; //maximum number of shifts a single person can work
}

const ViewEditSchedule = () => {
  const navigate = useNavigate();
  const { fetchWithAuth } = useApi();
  const { guid } = useParams<{ guid: string }>();
  const { data } = useQuery(loaderQuery("/api/schedule/{}/details", guid!));
  const [focusedTime, setFocusedTime] = React.useState<string | null>(null);
  const scheduleGenerated = data.shiftAssignments.length > 0;

  // Determines the maximum number of respondents available for a given timeslot
  // Used in calculating the color intensity for each cell in the calendar
  function getMaxAvailability() {
    let max = 0;
    for (const slot of availabilityPerTime.values()) {
      if (max < slot.length) {
        max = slot.length;
      }
    }
    return max;
  }

  // Calculates the color of the cell based on how many respondents are available
  // for the corresponding timeslot
  function calculateColors() {
    const colors: { [key: string]: string } = {};
    const maxAvailability = getMaxAvailability();
    for (const slot of availabilityPerTime.keys()) {
      colors[slot] =
        `color-mix(in srgb, var(--primary-active) ${(availabilityPerTime.get(slot)!.length / maxAvailability) * 100}%, transparent)`;
    }
    return colors;
  }

  type EditScheduleProps = {
    name: string;
    schedulePreferences: {
      minutesPerSlot: number;
      shiftIntervals: number;
      usersPerShift: number;
      maximumShiftDurationMinutes: number | undefined;
      maximumShiftsPerWorker: number | undefined;
      //minimumShiftsPerWorker: number | undefined;
    };
  };

  // Mutation for editing the schedule preferences with the user's input
  const updateScheduleMutation = useMutation({
    mutationFn: async (updatedSchedule: EditScheduleProps) => {
      const res = await fetchWithAuth(`/api/schedule/${guid}`, {
        method: "PATCH",
        body: JSON.stringify(updatedSchedule),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to edit schedule");
      }

      return true;
    },
    onSuccess: () => {
      // Invalidate the schedules query to update the schedule data with the new preferences
      // Does not send the user back to the homescreen
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  // Mutation for deleting the schedule
  const deleteScheduleMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(`/api/schedule/${guid}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete schedule");
      }

      return true;
    },
    onSuccess: () => {
      // Invalidate the schedules query and navigate back home since this schedule no longer exists
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      navigate("/");
    },
  });

  // Mutation for generating the schedule based on the current preferences and responses
  const generateScheduleMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(`/api/schedule/${guid}/generateSchedule`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to generate schedule");
      }

      return true;
    },
    onSuccess: () => {
      // Invalidate the schedules query
      // Does not send the user back to the homescreen
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  const [scheduleData, setScheduleData] = React.useState<ScheduleData>({
    name: "",
    shiftTimes: "",
    dates: undefined,
    hours: { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } } as TimeRange,
    pplPerShift: undefined,
    //optional parameters
    maxShiftLength: undefined,
    maxShifts: undefined,
  });

  // When the page is loaded, fill in information about the schedule based on the fetched data
  React.useEffect(() => {
    if (!data) return;
    setScheduleData({
      name: data.name,
      shiftTimes: data.schedulePreferences?.minutesPerSlot || 15,
      dates:
        data.dateCoverage?.map((d: string) => {
          const [year, month, day] = d.split("-").map(Number);
          return new Date(year, month - 1, day);
        }) ?? [],
      hours: {
        start: parseTimeString(data.startTime)!,
        end: parseTimeString(data.endTime)!,
      },
      pplPerShift: data.schedulePreferences?.usersPerShift || 1,
      maxShiftLength:
        data.schedulePreferences?.maximumShiftDurationMinutes === 0
          ? undefined
          : data.schedulePreferences?.maximumShiftDurationMinutes,
      maxShifts:
        data.schedulePreferences?.maximumShiftsPerWorker === 0
          ? undefined
          : data.schedulePreferences?.maximumShiftsPerWorker,
    });
  }, [data]);

  // If the schedule data is still loading, show a loading message
  if (!data) return <div>Loading...</div>;

  const availabilityPerTime = getAvailabilityPerTime();

  // Helper function to determine how many respondents are available for each timeslot based on the
  // fetched availability data
  function getAvailabilityPerTime() {
    const timeSlots = new Map<string, string[]>();
    for (const availability of data.availabilities) {
      for (const slot of availability.availabilitySlots) {
        if (timeSlots.has(slot)) {
          timeSlots.get(slot)!.push(availability.userName);
        } else {
          timeSlots.set(slot, [availability.userName]);
        }
      }
    }

    return timeSlots;
  }

  // Handles changes to text and number inputs, updating the scheduleData accordingly
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    setScheduleData((prev) => {
      if (event.target instanceof HTMLInputElement && event.target.type === "number") {
        if (value === "") return { ...prev, [name]: null };

        const numericValue = Number(value);
        if (Number.isNaN(numericValue)) return prev;

        return { ...prev, [name]: numericValue };
      }
      return { ...prev, [name]: value };
    });
  };

  // Handles numeric input on blur to emulate the same snapping behavior as the time inputs
  // Specifically used for the max shift length input, which must snap to a multiple of the shift interval
  const handleNumberBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (value === "") return;

    let numericValue = Number(value);
    if (Number.isNaN(numericValue)) return;

    if (name === "maxShiftLength") {
      const step = scheduleData.shiftTimes ? Number(scheduleData.shiftTimes) : 60;
      const min = step;
      const max = 1440;

      numericValue = snapToStep(numericValue, step, min);

      if (numericValue > max) numericValue = max;
    }

    setScheduleData((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
  };

  // Helper function that snaps a number to the nearest valid value based on a step and minimum value
  const snapToStep = (value: number, step: number, min: number) => {
    if (value < min) return min;

    const remainder = (value - min) % step;
    const lower = value - remainder;
    const upper = lower + step;

    return Math.abs(value - lower) <= Math.abs(value - upper) ? lower : upper;
  };

  // Called when the user submits the form, calls the update schedule mutation
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    addToasts(
      updateScheduleMutation.mutateAsync({
        name: scheduleData.name,
        schedulePreferences: {
          minutesPerSlot: Number(scheduleData.shiftTimes),
          shiftIntervals: Number(scheduleData.shiftTimes),
          usersPerShift: Number(scheduleData.pplPerShift),
          maximumShiftDurationMinutes: scheduleData.maxShiftLength,
          maximumShiftsPerWorker: scheduleData.maxShifts,
        },
      }),
    );
  };

  // Called when the user clicks the generate schedule button, calls the generate schedule mutation
  // after confirming with the user
  // Also allows for re-generating the schedule if one has already been generated
  const handleGenerate = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (
      (scheduleGenerated &&
        !confirm("Are you sure you want to generate this schedule? This will override the current schedule.")) ||
      (!scheduleGenerated &&
        !confirm(
          "Are you sure you want to generate this schedule? Once it's generated, no new responses will be accepted.",
        ))
    ) {
      return;
    }

    addToasts(generateScheduleMutation.mutateAsync(), "Generating schedule... This may take a while...");
  };

  // Called when the user clicks the delete schedule button, calls the delete schedule mutation
  // after confirming with the user
  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!confirm("Are you sure you want to delete this schedule?")) return;

    addToasts(deleteScheduleMutation.mutateAsync());
  };

  // If the schedule data is still loading, show a loading message
  if (!scheduleData) return <div>Loading...</div>;

  return (
    <div className="newSchedule">
      {
        // button to navigate back home
      }
      <button
        className="returnButton"
        onClick={() => {
          navigate("/");
        }}
      >
        <ArrowLeftIcon className="backIcon" />
        Home
      </button>
      <div>
        <div className="scheduleName">
          <b>{data.name}</b>
        </div>
        <h4 className="pageSubHeader">
          {data.availabilities.length} Respondent{data.availabilities.length !== 1 ? "s" : ""}
        </h4>
      </div>
      {
        // calendar showing the respondents' availabilities
      }
      <Calendar
        Cell={ColoredCell}
        minutesPerCell={scheduleData.shiftTimes as ValidMinutes}
        dates={scheduleData.dates ?? []}
        range={scheduleData.hours}
        colors={calculateColors()}
        setFocusedCell={setFocusedTime}
      />
      <div className="submitContainer">
        {
          // if a schedule is generated, show a link to the generated schedule
          // otherwise, show a link to the availability form
        }
        <Link to={`/schedule/${guid}`} className="generatedScheduleLink">
          {scheduleGenerated ? "Generated Schedule" : "Availability Form"}
        </Link>
        {
          // button to (re)generate the schedule
        }
        <button
          type="button"
          className="submitBtn"
          onClick={handleGenerate}
          disabled={
            updateScheduleMutation.isPending ||
            deleteScheduleMutation.isPending ||
            generateScheduleMutation.isPending ||
            data.availabilities.length == 0
          }
        >
          {scheduleGenerated ? "Regenerate Schedule" : "Generate Schedule"}
        </button>
      </div>
      <hr />
      <div>
        <h4 className="pageSubHeader">Edit Preferences:</h4>
      </div>
      <br />
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="scheduleName">Schedule Name</label>
          <br />
          <input
            className="input"
            type="text"
            id="name"
            name="name"
            value={scheduleData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="peoplePerShift">Workers per shift</label>
          <br />
          <input
            className="input"
            type="number"
            id="pplPerShift"
            name="pplPerShift"
            step="1"
            min="1"
            value={scheduleData.pplPerShift ?? ""}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="maxShiftLength">Maximum Shift Duration (in minutes)</label>
          <br />
          <input
            className="input"
            type="number"
            id="maxShiftLength"
            name="maxShiftLength"
            step={scheduleData.shiftTimes ? Number(scheduleData.shiftTimes) : 60}
            min={scheduleData.shiftTimes ? Number(scheduleData.shiftTimes) : 60}
            max="1440"
            value={scheduleData.maxShiftLength ?? ""}
            onChange={handleInputChange}
            onBlur={handleNumberBlur}
          />
        </div>
        <div>
          <label htmlFor="maxShifts">Maximum Shifts per Worker</label>
          <br />
          <input
            className="input"
            type="number"
            id="maxShifts"
            name="maxShifts"
            step="1"
            min="1"
            max="99999"
            value={scheduleData.maxShifts ?? ""}
            onChange={handleInputChange}
          />
        </div>
        <br />
        <div className="submitContainer">
          <button
            type="submit"
            className="submitBtn"
            disabled={
              updateScheduleMutation.isPending || deleteScheduleMutation.isPending || generateScheduleMutation.isPending
            }
          >
            Confirm Changes
          </button>
        </div>
        <br />
        <div className="submitContainer">
          <button
            type="button"
            className="deleteBtn"
            onClick={handleDelete}
            disabled={
              updateScheduleMutation.isPending || deleteScheduleMutation.isPending || generateScheduleMutation.isPending
            }
          >
            Delete Schedule
          </button>
        </div>
      </form>
      <MousePopup isOpen={!!availabilityPerTime.get(focusedTime ?? "")} width={250}>
        <div className="availablePeoplePopupRoot">
          <div className="availablePeoplePopupHeader">
            {availabilityPerTime.get(focusedTime ?? "")?.length || 0} Available Respondent
            {availabilityPerTime.get(focusedTime ?? "")?.length !== 1 && "s"}:
          </div>
          {availabilityPerTime.get(focusedTime ?? "")?.join(", ") ?? ""}
          {focusedTime && (
            <div className="availablePeoplePopupTime">
              {new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "UTC",
              }).format(new Date(focusedTime!))}
            </div>
          )}
        </div>
      </MousePopup>
    </div>
  );
};

export default ViewEditSchedule;
