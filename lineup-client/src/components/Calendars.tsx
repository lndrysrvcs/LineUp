import type { Time, TimeRange, ValidMinutes, Weekday } from "@/types";
import { addMinutesToTime, formatTime, getTimeIncrementLabel } from "@/utils/time";
import React from "react";
import "./calendar.css";

interface CalendarCellProps {
  time: Time;
  weekday: Weekday;
  isMouseDown: boolean;
  setIsMouseDown: React.Dispatch<React.SetStateAction<boolean>>;
  isEnablingCells: boolean;
  setIsEnablingCells: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CalendarProps {
  Cell: React.ComponentType<CalendarCellProps>;
  minutesPerCell: ValidMinutes;
  weekdays: Weekday[];
  range: TimeRange;
}

// Children are each cell of the calendar
const BaseCalendar = ({ Cell, minutesPerCell, weekdays, range }: CalendarProps) => {
  const [isMouseDown, setIsMouseDown] = React.useState(false);
  const [isEnablingCells, setIsEnablingCells] = React.useState(false);
  const numRows = (range.end.hour - range.start.hour) * (60 / minutesPerCell);

  function calculateCellClasses(row: number, col: number) {
    let output = "calendarCell";

    if (row === 0) {
      output += " calendarTopBorder";
    } else if ((range.start.minute + minutesPerCell * row) % 60 === 0) {
      output += " calendarTopBorder";
    } else if ((range.start.minute + minutesPerCell * row) % 30 === 0) {
      output += " calendarTopBorder dottedBorder";
    } else if (minutesPerCell === 20) {
      output += " calendarTopBorder dottedBorder";
    } else if (
      // that weird condition where 30 minutes are chosen but it starts at 15 minute increments
      minutesPerCell === 30 &&
      range.start.minute % 30 !== 0 &&
      (range.start.minute + minutesPerCell * row) % 60 === 15
    ) {
      output += " calendarTopBorder";
    }

    if (row === numRows - 1) {
      output += " calendarBottomBorder";
    }

    if (col === 0) {
      output += " calendarLeftBorder";
    }

    return output;
  }

  return (
    <div
      className="calendarWrapper"
      style={{
        gridTemplateColumns: `auto repeat(${weekdays.length}, 1fr)`,
        gridTemplateRows:
          minutesPerCell < 60 ? `auto repeat(${numRows + 1}, 1em) auto` : `auto repeat(${numRows + 1}, 1.5em)`,
      }}
    >
      <div className="calendarBlankCell" />
      {weekdays.map((day) => (
        <div key={day} className="calendarLabel">
          {day}
        </div>
      ))}

      {Array.from({ length: numRows }).map((_, row) => (
        <>
          <div className="calendarLabel calendarRowLabel">
            {getTimeIncrementLabel(row, range.start, minutesPerCell)}
          </div>
          {weekdays.map((day, col) => (
            <div key={day} className={calculateCellClasses(row, col)}>
              <Cell
                time={addMinutesToTime(range.start, (minutesPerCell * row) as ValidMinutes)}
                weekday={day}
                isMouseDown={isMouseDown}
                setIsMouseDown={setIsMouseDown}
                isEnablingCells={isEnablingCells}
                setIsEnablingCells={setIsEnablingCells}
              />
            </div>
          ))}
        </>
      ))}
      <div className="calendarLabel calendarRowLabel">{formatTime(range.end)}</div>
    </div>
  );
};

const CalendarCell = ({
  time,
  weekday,
  isMouseDown,
  setIsMouseDown,
  isEnablingCells,
  setIsEnablingCells,
}: CalendarCellProps) => {
  const [clicked, setClicked] = React.useState(false);

  function updateCell() {
    console.log(`Clicked on ${weekday} at ${formatTime(time)}`);
    setClicked((clicked) => !clicked);
  }

  function onMouseDown() {
    setIsMouseDown(true);
    setIsEnablingCells(!clicked);
    updateCell();
  }

  function onMouseEnter() {
    if (isMouseDown && clicked !== isEnablingCells) {
      updateCell();
    }
  }

  return (
    <button
      onMouseDown={onMouseDown}
      onMouseUp={() => setIsMouseDown(false)}
      onMouseEnter={onMouseEnter}
      className={"unstyledButton calendarInnerCell" + (clicked ? " clicked" : "")}
      title={weekday + " " + formatTime(time)}
    ></button>
  );
};

export { BaseCalendar, CalendarCell };
