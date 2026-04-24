import { WEEKDAYS, type Time, type TimeRange, type ValidHours, type ValidMinutes, type Weekday } from "@/types";

/** Checks if two {@link Time} objects represent the same time.
 * @returns If they represent the same time.
 */
function timesAreEqual(time1: Time, time2: Time): boolean {
  return time1.hour === time2.hour && time1.minute === time2.minute;
}

/** Adds a given amount of minutes to a {@link Time} object.
 * @returns The resulting Time after adding the minutes to the original Time.
 */
function addMinutesToTime(time: Time, minutes: ValidMinutes): Time {
  const addedMinutes = time.minute + minutes;
  const addedHours = time.hour + Math.floor(addedMinutes / 60);
  return {
    hour: (addedHours % 24) as Time["hour"],
    minute: (addedMinutes % 60) as Time["minute"],
  };
}

/** Formats a {@link Time} object into 12H format with AM/PM.
 * @returns The formatted time string.
 * @example formatTime({ hour: 9, minute: 15 })
 * // Returns "09:15 AM"
 */
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

/** Generates the label to be shown on a given row of the calendar, based on the row, starting time, and minutes per cell.
 * @param row - The row the cell is in.
 * @param rangeStart - The start time of the cell in the first row.
 * @param minutesPerCell - How long each cell is.
 * @returns The label (formatted with {@link formatTime}) to be shown for a row. Returns an empty string if the row should not contain a label.
 */
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

/** Converts a number representing a day of the week (0-6) to the corresponding weekday string (`"Sunday"`-`"Saturday"`). */
function dayNumberToWeekday(num: number): Weekday {
  return WEEKDAYS[num];
}

/** Converts a weekday string (`"Sunday"`-`"Saturday"`) to the corresponding number (0-6). */
function weekdayToNum(weekday: Weekday): number {
  return WEEKDAYS.indexOf(weekday);
}

/** Takes a time string in 24H format (e.g. `"23:59"`) and converts it to a {@link Time} object.
 * @returns The converted Time object or `null` if the string is invalid.
 */
function parseTimeString(time: string): Time | null {
  if (!time?.includes(":")) return null;

  const [hourStr, minuteStr] = time.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;

  return {
    hour: hour as ValidHours,
    minute: minute as ValidMinutes,
  };
}

/** Formats a {@link Time} object into 24H format without AM/PM.
 * @returns The formatted time string.
 * @example formatTime({ hour: 17, minute: 15 })
 * // Returns "17:15"
 */
function formatTime24Hour(time: Time): string {
  return `${time.hour.toString().padStart(2, "0")}:${time.minute.toString().padStart(2, "0")}`;
}

/** Returns the valid minute values that can be chosen for the given cell size. */
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

/** Converts a time to just how many minutes that time is past midnight.
 * @param isEnd - If the time is the end of the range.
 * @remarks Used in validating start and end times on submission.
 * @example toMinutes({ hour: 1, minute: 30 })
 * // returns 90
 * @returns The number of minutes past midnight or 1440 if the time represents 24 hours.
 */
function toMinutes(time: Time, isEnd = false): number {
  // Needed to allow midnight as end time
  if (isEnd && time.hour === 0 && time.minute === 0) {
    return 1440;
  }
  return time.hour * 60 + time.minute;
}

/** Returns true if the given {@link TimeRange} represents a 24-hour range starting and ending at midnight; false otherwise. */
function rangeIs24Hours(range: TimeRange): boolean {
  if (range.start.hour === 0 && range.end.hour === 0) {
    if (range.start.minute === 0 && range.end.minute === 0) {
      return true;
    }
  }
  return false;
}

/** Combines a Time object to a Date object, returning a new Date object with the specified day of the Date but the specified time of the Time object.
 * @example const date = const result = addTimeToDate(new Date("2024-01-01T10:15:00"), { hour: 9, minute: 30 });
 * // returns a Date object on January 1st at 9:30 AM.
 */
function addTimeToDate(date: Date, time: Time): Date {
  const newDate = new Date(date);
  newDate.setHours(time.hour, time.minute, 0, 0);
  return newDate;
}

/** Takes a Date and Time and converts it to a standardized ISO string in UTC.
 * @returns The ISO string, formatted "YYYY-MM-DDTHH:MM".
 * @remarks Calls {@link addTimeToDate}, which sets the Date's time to the Time object.
 */
function standardizeDateAndTime(date: Date, time: Time): string {
  const dateWithTime = addTimeToDate(date, time);
  const utcDate = new Date(dateWithTime.getTime() - dateWithTime.getTimezoneOffset() * 60 * 1000);
  return utcDate.toISOString().replace(".000", "");
}

export {
  addMinutesToTime,
  addTimeToDate,
  dayNumberToWeekday,
  formatTime,
  formatTime24Hour,
  getTimeIncrementLabel,
  getValidMinutesForInterval,
  parseTimeString,
  rangeIs24Hours,
  standardizeDateAndTime,
  timesAreEqual,
  toMinutes,
  weekdayToNum,
};
