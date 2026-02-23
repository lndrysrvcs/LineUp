import type { DateDay, Time, TimeRange, ValidMinutes } from "@/types";
//import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router";
import React from "react";
import DatePickerModule, { DateObject } from "react-multi-date-picker";
import {
  parseTimeString,
  formatTimeForInput,
  getValidMinutesForInterval,
  toMinutes,
  convertToDateDays,
} from "@/utils/time.ts";

// This is because importing DatePicker directly didn't work with Vite for some reason
// Trust me that this is somehow the most elegant solution I could find
// @ts-expect-error: react-multi-date-picker is funky with Vite
const DatePicker = DatePickerModule.default || DatePickerModule;

interface ScheduleData {
  name: string; //the name of the event
  shiftTimes: ValidMinutes | "" | undefined; //how the availability intervals are determined
  dates: Date[] | undefined; //the dates being scheduled (js Date version)
  dateDays: DateDay[]; //the dates being schedules (DateDay version)
  hours: TimeRange; //the hours throughout the day that need covered
  pplPerShift: number | undefined; //how many people should work simultaneously

  // optional parameters
  maxShiftLength: number | undefined; //maximum length of time a single person can work continuously, in minutes
  maxShifts: number | undefined; //maximum number of shifts a single person can work
}

const NewSchedule = () => {
  const navigate = useNavigate();

  const [scheduleData, setScheduleData] = React.useState<ScheduleData>({
    name: "",
    shiftTimes: "",
    dates: undefined,
    dateDays: [{ date: "1/1", day: "Thursday" }] as DateDay[],
    hours: { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } } as TimeRange,
    pplPerShift: undefined,
    //optional parameters
    maxShiftLength: undefined,
    maxShifts: undefined,
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    setScheduleData((prev) => ({
      ...prev,
      [name]: event.target.type === "number" || name === "shiftTimes" ? Number(value) : value,
    }));
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

    if (checkValidTimeRange(scheduleData.shiftTimes, scheduleData.hours) === 1) {
      alert("Invalid time range based on selected shift interval.");
      return;
    }

    console.log(
      "Submitted name:",
      scheduleData.name,
      "; Submitted avail. interval: ",
      scheduleData.shiftTimes,
      "; Submitted dates (Dates): ",
      scheduleData.dates,
      "; Submitted dates (DateDays): ",
      scheduleData.dateDays,
      "; Submitted duration: ",
      scheduleData.hours.start,
      " to ",
      scheduleData.hours.end,
      "; Submitted pplpershift: ",
      scheduleData.pplPerShift,
      "; Submitted maximum shift time: ",
      scheduleData.maxShiftLength ?? 1440,
      "; Submitted maximum shifts: ",
      scheduleData.maxShifts ?? 99999,
    );

    //TODO: add to user's events
    //TODO: send data to backend
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
        dateDays: [],
      }));
      return;
    }

    const dateArray = Array.isArray(value) ? value : [value];
    const jsDates = dateArray.map((d) => d.toDate());

    setScheduleData((prev) => ({
      ...prev,
      dates: jsDates,
      dateDays: convertToDateDays(jsDates),
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
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="scheduleName">
            Schedule Name<label className="requiredStar">*</label>:{" "}
          </label>
          <input type="text" id="name" name="name" value={scheduleData.name} onChange={handleInputChange} required />
        </div>
        <div>
          <label htmlFor="shiftTimes">
            Shift Intervals (in minutes)<label className="requiredStar">*</label>:{" "}
          </label>
          <select
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
          <label htmlFor="scheduleDuration">
            Schedule Duration<label className="requiredStar">*</label>:{" "}
          </label>
          <input
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
            type="time"
            id="endTime"
            name="endTime"
            value={formatTimeForInput(scheduleData.hours.end)}
            step={scheduleData.shiftTimes ? Number(scheduleData.shiftTimes) * 60 : 60}
            onChange={handleEndTimeChange}
            required
          />
          <br />
          <label>
            Dates<label className="requiredStar">*</label>:{" "}
          </label>
          <DatePicker
            multiple
            value={scheduleData.dates?.map((d) => new DateObject(d)) || []}
            onChange={handleDateChange}
            minDate={new Date()}
            required
          />
          <br />
        </div>
        <div>
          <label htmlFor="peoplePerShift">
            Workers per shift<label className="requiredStar">*</label>:{" "}
          </label>
          <input
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
          <label htmlFor="maxShiftLength">Maximum Shift Duration (in minutes): </label>
          <input
            type="number"
            id="maxShiftLength"
            name="maxShiftLength"
            step={scheduleData.shiftTimes ? Number(scheduleData.shiftTimes) : 60}
            min={scheduleData.shiftTimes ? Number(scheduleData.shiftTimes) : 60}
            value={scheduleData.maxShiftLength ?? ""}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="maxShifts">Maximum Shifts per Worker: </label>
          <input
            type="number"
            id="maxShifts"
            name="maxShifts"
            step="1"
            min="1"
            value={scheduleData.maxShifts ?? ""}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit" className="scheduleBtn">
          Create Schedule
        </button>
      </form>
      <button
        className="rightButton"
        onClick={() => {
          navigate("/");
        }}
      >
        Back to Home
      </button>{" "}
    </div>
  );
};

export default NewSchedule;
