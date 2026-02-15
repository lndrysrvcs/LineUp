import type { DateDay, Time, TimeRange, ValidMinutes } from "@/types";
import { addMinutesToTime, formatDate, formatTime, getTimeIncrementLabel, weekdayToNum } from "@/utils/time";
import React from "react";
import "./calendar.css";

interface CalendarCellProps {
  time: Time;
  date: DateDay;
  isMouseDown: boolean;
  setIsMouseDown: React.Dispatch<React.SetStateAction<boolean>>;
  isEnablingCells: boolean;
  setIsEnablingCells: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CalendarProps {
  Cell: React.ComponentType<CalendarCellProps>;
  minutesPerCell: ValidMinutes;
  dates: DateDay[];
  range: TimeRange;
}

// Children are each cell of the calendar
const BaseCalendar = ({ Cell, minutesPerCell, dates, range }: CalendarProps) => {
  const [isMouseDown, setIsMouseDown] = React.useState(false);
  const [isEnablingCells, setIsEnablingCells] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(0);
  const numRows =
    (range.end.hour - range.start.hour) * (60 / minutesPerCell) +
    Math.ceil((range.end.minute - range.start.minute) / minutesPerCell);

  function calculatePageStarts() {
    const pageStarts = [0];
    if (dates.length <= 7) {
      return pageStarts;
    }

    for (let i = 1; i < dates.length; i++) {
      if (weekdayToNum(dates[i].day) <= weekdayToNum(dates[i - 1].day)) {
        pageStarts.push(i);
      }
    }
    return pageStarts;
  }

  function getPageDates(page?: number) {
    if (dates.length <= 7) {
      return dates;
    }
    page ??= currentPage;
    const pageStarts = calculatePageStarts();
    return dates.slice(pageStarts[page], pageStarts[page + 1]);
  }

  function calculateCellClasses(row: number, col: number) {
    let output = "calendarCell";

    if (row === 0) {
      output += " calendarTopBorder";
    } else if (minutesPerCell === 60 || (range.start.minute + minutesPerCell * row) % 60 === 0) {
      output += " calendarTopBorder";
    } else if ((range.start.minute + minutesPerCell * row) % 30 === 0) {
      output += " calendarTopBorder dottedBorder";
    } else if (minutesPerCell % 20 === 0) {
      output += " calendarTopBorder dottedBorder";
    } else if (
      // that weird condition where 30 minutes are chosen but it starts at 15 minute increments
      minutesPerCell === 30 &&
      range.start.minute % 30 !== 0 &&
      (range.start.minute + minutesPerCell * row) % 60 === 15
    ) {
      output += " calendarTopBorder";
    } else if (minutesPerCell === 30) {
      output += " calendarTopBorder dottedBorder";
    }

    if (row === numRows - 1) {
      output += " calendarBottomBorder";
    }

    if (col === 0 || (col > 0 && needsSpaceAfterCol(col - 1))) {
      output += " calendarLeftBorder";
    }

    return output;
  }

  function needsSpaceAfterCol(col: number) {
    return (
      col < getPageDates().length - 1 &&
      weekdayToNum(getPageDates()[col].day) + 1 !== weekdayToNum(getPageDates()[col + 1].day)
    );
  }

  function extraColMargin(col: number) {
    const style: React.CSSProperties = {};
    if (col > 0 && needsSpaceAfterCol(col - 1)) {
      style.marginLeft = "4px";
    }
    if (needsSpaceAfterCol(col)) {
      style.marginRight = "4px";
    }
    return style;
  }

  return (
    <div
      className="calendarWrapper"
      style={{
        maxWidth: getPageDates().length * 200,
        gridTemplateColumns: `auto repeat(${getPageDates().length}, 1fr)`,
        gridTemplateRows:
          minutesPerCell < 60 ? `auto repeat(${numRows + 1}, 1em) auto` : `auto repeat(${numRows + 1}, 1.5em)`,
      }}
    >
      <div className="calendarBlankCell" />
      {getPageDates().map((date, col) => (
        <div key={date.day} className="calendarLabel" style={extraColMargin(col)}>
          {date.day}
          <br />
          {date.date}
        </div>
      ))}

      {Array.from({ length: numRows }).map((_, row) => (
        <React.Fragment key={row}>
          <div className="calendarLabel calendarRowLabel">
            {getTimeIncrementLabel(row, range.start, minutesPerCell)}
          </div>
          {getPageDates().map((date, col) => (
            <div key={date.date} className={calculateCellClasses(row, col)} style={extraColMargin(col)}>
              <Cell
                time={addMinutesToTime(range.start, (minutesPerCell * row) as ValidMinutes)}
                date={date}
                isMouseDown={isMouseDown}
                setIsMouseDown={setIsMouseDown}
                isEnablingCells={isEnablingCells}
                setIsEnablingCells={setIsEnablingCells}
              />
            </div>
          ))}
        </React.Fragment>
      ))}
      <div className="calendarLabel calendarRowLabel">{formatTime(range.end)}</div>
    </div>
  );
};

const CalendarCell = ({
  time,
  date,
  isMouseDown,
  setIsMouseDown,
  isEnablingCells,
  setIsEnablingCells,
}: CalendarCellProps) => {
  const [clicked, setClicked] = React.useState(false);

  function updateCell() {
    console.log(`Clicked on ${formatDate(date, time)}`);
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
      title={date.day + " " + formatTime(time)}
    ></button>
  );
};

export { BaseCalendar, CalendarCell };
