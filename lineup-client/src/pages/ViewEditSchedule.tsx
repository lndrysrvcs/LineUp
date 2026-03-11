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
import { useNavigate, useParams } from "react-router";
import "../dateinput.css";
import "./newschedule.css";

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
  const availabilityPerTime = getAvailabilityPerTime();

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

  function getMaxAvailability() {
    let max = 0;
    for (const slot of availabilityPerTime.values()) {
      if (max < slot.length) {
        max = slot.length;
      }
    }
    return max;
  }

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
    };
  };

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
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      navigate("/");
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

  React.useEffect(() => {
    console.log("Fetched schedule:", data);
    setScheduleData({
      name: data.name,
      shiftTimes: data.schedulePreferences?.minutesPerSlot || 15,
      dates: data.dateCoverage?.map((d: string) => new Date(d)) ?? [],
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    setScheduleData((prev) => {
      if (event.target instanceof HTMLInputElement && event.target.type === "number") {
        if (value === "") return { ...prev, [name]: undefined };

        let numericValue = Number(value);
        const maxValue = event.target.max ? Number(event.target.max) : undefined;
        const minValue = event.target.min ? Number(event.target.min) : undefined;

        if (maxValue !== undefined && numericValue > maxValue) numericValue = maxValue;
        if (minValue !== undefined && numericValue < minValue) numericValue = minValue;

        return { ...prev, [name]: numericValue };
      }
      return { ...prev, [name]: value };
    });
  };

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

  const handleGenerate = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    //TODO: call backend to generate schedule
    // Note: when calling generate schedule, use 1440 and 99999 as default values for maxShiftDuration and maxShiftsPerWorker
  };

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!confirm("Are you sure you want to delete this schedule?")) return;

    addToasts(deleteScheduleMutation.mutateAsync());
  };

  if (!scheduleData) return <div>Loading...</div>;

  return (
    <div className="newSchedule">
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
      <Calendar
        Cell={ColoredCell}
        minutesPerCell={scheduleData.shiftTimes as ValidMinutes}
        dates={scheduleData.dates ?? []}
        range={scheduleData.hours}
        colors={calculateColors()}
        setFocusedCell={setFocusedTime}
      ></Calendar>
      <div className="submitContainer">
        <button
          type="button"
          className="submitBtn"
          onClick={handleGenerate}
          disabled={updateScheduleMutation.isPending || deleteScheduleMutation.isPending}
        >
          Generate Schedule
        </button>
      </div>
      <hr />
      <div>
        <h4 className="pageSubHeader">Edit Preferences:</h4>
      </div>
      <br />
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="scheduleName">Schedule Name: </label>
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
          <label htmlFor="peoplePerShift">Workers per shift: </label>
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
          <label htmlFor="maxShiftLength">Maximum Shift Duration (in minutes):</label>
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
          />
        </div>
        <div>
          <label htmlFor="maxShifts">Maximum Shifts per Worker:</label>
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
            disabled={updateScheduleMutation.isPending || deleteScheduleMutation.isPending}
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
            disabled={updateScheduleMutation.isPending || deleteScheduleMutation.isPending}
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
              }).format(new Date(focusedTime!))}
            </div>
          )}
        </div>
      </MousePopup>
    </div>
  );
};

export default ViewEditSchedule;
