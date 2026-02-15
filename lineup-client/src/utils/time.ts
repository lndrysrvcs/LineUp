import { WEEKDAYS, type DateDay, type Time, type ValidMinutes, type Weekday } from "@/types";

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

export { addMinutesToTime, formatDate, formatTime, getTimeIncrementLabel, timesAreEqual, weekdayToNum };
