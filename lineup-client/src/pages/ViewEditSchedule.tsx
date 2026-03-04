import type { DateDay, TimeRange, ValidMinutes } from "@/types";
//import { useAuth0 } from "@auth0/auth0-react";
import { queryClient, useApi } from "@/utils/api";
import { addToasts } from "@/utils/db";
import toast from "react-hot-toast";
import { convertToDateDays, parseTimeString } from "@/utils/time.ts";
import { useQuery, useMutation } from "@tanstack/react-query";
import React, { type MouseEvent } from "react";
import { useNavigate } from "react-router";
import "./newschedule.css";
import "../dateinput.css";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useParams } from "react-router";
import { Calendar } from "@/components/Calendar";
// TODO: Replace with availability viewable cell when that's made
import { FillableCell } from "@/components/CalendarCells";

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

const ViewEditSchedule = () => {
  const navigate = useNavigate();
  const { fetchWithAuth } = useApi();
  const { guid } = useParams<{ guid: string }>();

  const {
    data: schedule,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["schedules", guid],
    queryFn: () =>
      fetchWithAuth(`/api/schedule/${guid}`).then(async (res) => {
        if (!res.ok) {
          toast.error(<b>Failed to fetch schedule</b>, { id: "fetch-schedule-error", duration: Infinity });
          throw new Error("Failed to fetch schedule");
        } else {
          toast.dismiss("fetch-schedule-error");
        }
        const resJson = await res.json();
        return resJson;
      }),
  });

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
    dateDays: [{ date: "1/1", day: "Thursday" }] as DateDay[],
    hours: { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } } as TimeRange,
    pplPerShift: undefined,
    //optional parameters
    maxShiftLength: undefined,
    maxShifts: undefined,
  });

  React.useEffect(() => {
    if (!schedule) return;

    const jsDates = schedule.dateCoverage?.map((d: string) => new Date(d)) ?? [];
    console.log("Fetched schedule:", schedule);
    setScheduleData({
      name: schedule.name,
      shiftTimes: schedule.schedulePreferences?.minutesPerSlot || 15,
      dates: jsDates,
      dateDays: convertToDateDays(jsDates),
      hours: {
        start: parseTimeString(schedule.startTime)!,
        end: parseTimeString(schedule.endTime)!,
      },
      pplPerShift: schedule.schedulePreferences?.usersPerShift || 1,
      maxShiftLength:
        schedule.schedulePreferences?.maximumShiftDurationMinutes === 0
          ? undefined
          : schedule.schedulePreferences?.maximumShiftDurationMinutes,
      maxShifts:
        schedule.schedulePreferences?.maximumShiftsPerWorker === 0
          ? undefined
          : schedule.schedulePreferences?.maximumShiftsPerWorker,
    });
  }, [schedule]);

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
    console.log("Generate Schedule button clicked");
    //TODO: call backend to generate schedule
    // Note: when calling generate schedule, use 1440 and 99999 as default values for maxShiftDuration and maxShiftsPerWorker
  };

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!confirm("Are you sure you want to delete this schedule?")) return;

    addToasts(deleteScheduleMutation.mutateAsync());
  };

  if (isLoading || !scheduleData) return <div>Loading...</div>;
  if (isError) return <div>Error loading schedule.</div>;

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
        <h3 className="pageHeader">{schedule.name}</h3>
        {/* TODO: actually represent the number of respondents */}
        <h4 className="pageSubHeader">Respondents: {0}</h4>
      </div>
      <Calendar
        Cell={FillableCell}
        minutesPerCell={scheduleData.shiftTimes as ValidMinutes}
        dates={scheduleData.dateDays}
        range={scheduleData.hours}
      ></Calendar>
      <div className="submitContainer">
        <button type="button" className="submitBtn" onClick={handleGenerate}>
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
          <button type="submit" className="submitBtn">
            Confirm Changes
          </button>
        </div>
        <br />
        <div className="submitContainer">
          <button type="button" className="deleteBtn" onClick={handleDelete}>
            Delete Schedule
          </button>
        </div>
      </form>
    </div>
  );
};

export default ViewEditSchedule;
