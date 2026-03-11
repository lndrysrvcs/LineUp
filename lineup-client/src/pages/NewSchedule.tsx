import type { Time, TimeRange, ValidMinutes } from "@/types";
//import { useAuth0 } from "@auth0/auth0-react";
import { queryClient, useApi } from "@/utils/api";
import { addToasts } from "@/utils/db";
import { formatTimeForInput, getValidMinutesForInterval, parseTimeString, toMinutes } from "@/utils/time.ts";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import DatePickerModule, { DateObject } from "react-multi-date-picker";
import { useNavigate } from "react-router";
import "../dateinput.css";
import "./newSchedule.css";

// This is because importing DatePicker directly didn't work with Vite for some reason
// Trust me that this is somehow the most elegant solution I could find
// @ts-expect-error: react-multi-date-picker is funky with Vite
const DatePicker = DatePickerModule.default || DatePickerModule;

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

const NewSchedule = () => {
  const navigate = useNavigate();
  const { fetchWithAuth } = useApi();

  type CreateScheduleProps = {
    name: string;
    dateCoverage: string[];
    startTime: string;
    endTime: string;
    schedulePreferences: {
      minutesPerSlot: number;
      shiftIntervals: number;
      usersPerShift: number;
      maximumShiftDurationMinutes: number | undefined;
      maximumShiftsPerWorker: number | undefined;
    };
  };

  const createScheduleMutation = useMutation({
    mutationFn: async (newSchedule: CreateScheduleProps) => {
      const res = await fetchWithAuth(`/api/schedule`, {
        method: "POST",
        body: JSON.stringify(newSchedule),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to add schedule");
      }

      return res.json();
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

    switch (checkValidTimeRange(scheduleData.shiftTimes, scheduleData.hours)) {
      case 1:
        alert("Cannot have Schedule Duration end before it starts.");
        return;
      case 2:
        alert("Duration start time minutes must be compatible with chosen shift interval.");
        return;
      case 3:
        alert("Duration end time minutes must be compatible with chosen shift interval.");
        return;
      case 4:
        alert("Total Duration must be divisible by chosen shift interval.");
        return;
      case 0:
        break;
    }

    addToasts(
      createScheduleMutation.mutateAsync({
        name: scheduleData.name,
        dateCoverage: scheduleData.dates?.map((d) => d.toISOString().split("T")[0]) || [],
        startTime: formatTimeForInput(scheduleData.hours.start),
        endTime: formatTimeForInput(scheduleData.hours.end),
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

  const handleStartTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseTimeString(event.target.value);
    if (!parsed) return;

    const snappedStart = snapToInterval(parsed, Number(scheduleData.shiftTimes));

    setScheduleData((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        start: snappedStart,
      },
    }));
  };

  const handleEndTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseTimeString(event.target.value);
    if (!parsed) return;

    const snappedEnd = snapToInterval(parsed, Number(scheduleData.shiftTimes));

    setScheduleData((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        end: snappedEnd,
      },
    }));
  };

  const snapToInterval = (time: Time, interval: number): Time => {
    const validMinutes = getValidMinutesForInterval(interval);

    const closestMinute = validMinutes.reduce((prev, curr) =>
      Math.abs(curr - time.minute) <= Math.abs(prev - time.minute) ? curr : prev,
    );

    return {
      hour: time.hour,
      minute: closestMinute as ValidMinutes,
    };
  };

  const handleDateChange = (value: DateObject | DateObject[] | null) => {
    if (!value) {
      setScheduleData((prev) => ({
        ...prev,
        dates: [],
      }));
      return;
    }

    const dateArray = Array.isArray(value) ? value : [value];
    const jsDates = dateArray.map((d) => d.toDate());

    setScheduleData((prev) => ({
      ...prev,
      dates: jsDates,
    }));
  };

  const checkValidTimeRange = (intervalLength: ValidMinutes | "" | undefined, hours: TimeRange): number => {
    if (!intervalLength) return 0;

    const interval = Number(intervalLength);
    const validMinutes = getValidMinutesForInterval(interval);
    const startMinutes = toMinutes(hours.start);
    const endMinutes = toMinutes(hours.end, true);

    if (startMinutes >= endMinutes) return 1;
    if (!validMinutes.includes(hours.start.minute)) return 2;
    if (!validMinutes.includes(hours.end.minute)) return 3;
    if ((endMinutes - startMinutes) % interval !== 0) return 4;

    return 0;
  };

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
      </button>{" "}
      <div>
        <h3 className="pageHeader">New Schedule</h3>
      </div>
      <hr />
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="scheduleName" className="required">
            Schedule Name
          </label>
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
          <label htmlFor="shiftTimes" className="required">
            Shift Intervals (in minutes)
          </label>
          <br />
          <select
            className="input"
            name="shiftTimes"
            id="shiftTimes"
            value={scheduleData.shiftTimes ?? ""}
            onChange={handleInputChange}
            required
          >
            <option value="" disabled>
              -- Select shift interval --
            </option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="40">40</option>
            <option value="45">45</option>
            <option value="60">60</option>
          </select>
        </div>
        <div>
          <label htmlFor="scheduleDuration" className="required">
            Schedule Duration
          </label>
          <br />
          <input
            className="input"
            type="time"
            id="startTime"
            name="startTime"
            value={formatTimeForInput(scheduleData.hours.start)}
            step={scheduleData.shiftTimes ? Number(scheduleData.shiftTimes) * 60 : 60}
            onChange={handleStartTimeChange}
            required
          />
          <label> to </label>
          <input
            className="endInput"
            type="time"
            id="endTime"
            name="endTime"
            value={formatTimeForInput(scheduleData.hours.end)}
            step={scheduleData.shiftTimes ? Number(scheduleData.shiftTimes) * 60 : 60}
            onChange={handleEndTimeChange}
            required
          />
          <br />
          <label className="required">Dates</label>
          <br />
          <DatePicker
            inputClass="input"
            className="purple"
            multiple
            value={scheduleData.dates?.map((d) => new DateObject(d)) || []}
            onChange={handleDateChange}
            minDate={new Date()}
            required
          />
          <br />
        </div>
        <div>
          <label htmlFor="peoplePerShift" className="required">
            Workers per shift
          </label>
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
          <button type="submit" className="submitBtn" disabled={createScheduleMutation.isPending}>
            Create Schedule
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewSchedule;
