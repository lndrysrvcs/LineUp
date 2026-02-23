import { WEEKDAYS, type DateDay, type Time, type ValidMinutes, type Weekday, type ValidHours } from "@/types";

function timesAreEqual(time1: Time, time2: Time): boolean {
  return time1.hour === time2.hour && time1.minute === time2.minute;
}

function addMinutesToTime(time: Time, minutes: ValidMinutes): Time {
  const addedMinutes = time.minute + minutes;
  const addedHours = time.hour + Math.floor(addedMinutes / 60);
  return {
    hour: (addedHours % 24) as Time["hour"],
    minute: (addedMinutes % 60) as Time["minute"],
  };
}

function formatTime(time: Time): string {
  let hourString = "";
  let isPM = false;
  if (time.hour >= 12) {
    isPM = true;
  }
  if (time.hour === 0) {
    hourString = "12";
  } else if (time.hour > 12) {
    hourString = (time.hour - 12).toString();
  } else {
    hourString = time.hour.toString();
  }
  return (
    hourString.toString().padStart(2, "0") + ":" + time.minute.toString().padStart(2, "0") + " " + (isPM ? "PM" : "AM")
  );
}

function formatDate(date: DateDay, time: Time): string {
  return `${date.day}, ${date.date} at ${formatTime(time)}`;
}

function getTimeIncrementLabel(row: number, rangeStart: Time, minutesPerCell: ValidMinutes): string {
  const time = addMinutesToTime(rangeStart, (minutesPerCell * row) as ValidMinutes);

  if (timesAreEqual(rangeStart, time)) return formatTime(time);
  if (time.minute === 0) return formatTime(time);
  if (minutesPerCell === 60) return formatTime(time);
  // that weird condition where 30 minutes are chosen but it starts at 15 minute increments:
  if (minutesPerCell === 30 && rangeStart.minute % 30 !== 0 && time.minute === 15) return formatTime(time);
  if (minutesPerCell === 15 && time.minute === 30) return formatTime(time);

  return "";
}

function weekdayToNum(weekday: Weekday): number {
  return WEEKDAYS.indexOf(weekday);
}

// should return something like "2/12-14:30". This should be completely unique per date and time
function formatDateTime(date: string, time: Time): string {
  return `${date}-${time.hour.toString().padStart(2, "0")}:${time.minute.toString().padStart(2, "0")}`;
}

// Takes a time string in 24H format (e.g. "23:59") and converts it to a Time object
function parseTimeString(time: string): Time | null {
  if (!time || !time.includes(":")) return null;

  const [hourStr, minuteStr] = time.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;

  return {
    hour: hour as ValidHours,
    minute: minute as ValidMinutes,
  };
}

// Reworked formatting just for time input (24H), which is incompatible with the above formatTime (12H)
function formatTimeForInput(time: Time): string {
  return `${time.hour.toString().padStart(2, "0")}:${time.minute.toString().padStart(2, "0")}`;
}

// Returns the valid minute values that can be chosen for the given cell size
function getValidMinutesForInterval(interval: number): number[] {
  switch (interval) {
    case 15:
    case 30:
    case 45:
      return [0, 15, 30, 45];
    case 20:
    case 40:
      return [0, 20, 40];
    case 60:
    default:
      return [0, 15, 20, 30, 40, 45];
  }
}

// Used in validating start and end times on submission
function toMinutes(time: Time, isEnd = false): number {
  // Needed to allow midnight as end time
  if (isEnd && time.hour === 0 && time.minute === 0) {
    return 1440;
  }
  return time.hour * 60 + time.minute;
}

// Converts an array of Date objects to DateDays
function convertToDateDays(dates: Date[]): DateDay[] {
  return dates.map((jsDate) => ({
    date: `${jsDate.getMonth() + 1}/${jsDate.getDate()}`,
    day: jsDate.toLocaleDateString("en-US", {
      weekday: "long",
    }) as Weekday,
  }));
}

export {
  addMinutesToTime,
  formatDate,
  formatDateTime,
  formatTime,
  getTimeIncrementLabel,
  timesAreEqual,
  weekdayToNum,
  parseTimeString,
  formatTimeForInput,
  getValidMinutesForInterval,
  toMinutes,
  convertToDateDays,
};
