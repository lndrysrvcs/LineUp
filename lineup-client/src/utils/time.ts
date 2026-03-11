import { WEEKDAYS, type Time, type TimeRange, type ValidHours, type ValidMinutes, type Weekday } from "@/types";

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

function formatDate(date: Date, time: Time): string {
  return `${date.toLocaleDateString()}, ${formatTime(time)}`;
}

function getTimeIncrementLabel(row: number, rangeStart: Time, minutesPerCell: ValidMinutes): string {
  const time = addMinutesToTime(rangeStart, (minutesPerCell * row) as ValidMinutes);

  if (timesAreEqual(rangeStart, time)) return formatTime(time);
  if (time.minute === 0) return formatTime(time);
  if (minutesPerCell === 60) return formatTime(time);
  if (minutesPerCell === 45 && time.minute % 30 === 0) return formatTime(time);
  // that weird condition where 30 minutes are chosen but it starts at 15 minute increments:
  if (minutesPerCell === 30 && rangeStart.minute % 30 !== 0 && time.minute === 15) return formatTime(time);
  if (minutesPerCell === 15 && time.minute === 30) return formatTime(time);

  return "";
}

function dayNumberToWeekday(num: number): Weekday {
  return WEEKDAYS[num];
}

function weekdayToNum(weekday: Weekday): number {
  return WEEKDAYS.indexOf(weekday);
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

function rangeIs24Hours(range: TimeRange): boolean {
  if (range.start.hour === 0 && range.end.hour === 0) {
    if (range.start.minute === 0 && range.end.minute === 0) {
      return true;
    }
  }
  return false;
}

function addTimeToDate(date: Date, time: Time): Date {
  const newDate = new Date(date);
  newDate.setHours(time.hour, time.minute, 0, 0);
  return newDate;
}

export {
  addMinutesToTime,
  addTimeToDate,
  dayNumberToWeekday,
  formatDate,
  formatTime,
  formatTimeForInput,
  getTimeIncrementLabel,
  getValidMinutesForInterval,
  parseTimeString,
  rangeIs24Hours,
  timesAreEqual,
  toMinutes,
  weekdayToNum,
};
