import type { TimeRange, ValidMinutes, Weekday } from "@/types";

interface Props {
  children: React.ReactNode;
  minutesPerCell: ValidMinutes;
  weekdays: Weekday[];
  range: TimeRange;
}

// Children are each cell of the calendar
const BaseCalendar = ({ children, minutesPerCell, weekdays, range }: Props) => {
  return <>hi</>;
};

export default BaseCalendar;
