import type { DateDay, TimeRange, ValidMinutes } from "@/types";
import { addMinutesToTime, formatTime, getTimeIncrementLabel, weekdayToNum } from "@/utils/time";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { Fragment, useEffect, useState } from "react";
import "./calendar.css";
import type { CalendarCellProps } from "./CalendarCells";

interface CalendarProps {
  Cell: React.ComponentType<CalendarCellProps>;
  minutesPerCell: ValidMinutes;
  dates: DateDay[];
  range: TimeRange;
}

// Children are each cell of the calendar
const BaseCalendar = ({ Cell, minutesPerCell, dates, range }: CalendarProps) => {
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [isEnablingCells, setIsEnablingCells] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const numRows =
    (range.end.hour - range.start.hour) * (60 / minutesPerCell) +
    Math.ceil((range.end.minute - range.start.minute) / minutesPerCell);
  const pageDates = getPageDates(currentPage);

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
    if (col >= pageDates.length - 1) return false;

    if (pageDates[col].day === "Sunday") {
      return pageDates[col + 1].day !== "Monday";
    } else {
      return weekdayToNum(pageDates[col].day) + 1 !== weekdayToNum(pageDates[col + 1].day);
    }
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

  useEffect(() => {
    globalThis.addEventListener("pointerup", () => setIsPointerDown(false));
    return () => globalThis.removeEventListener("pointerup", () => setIsPointerDown(false));
  });

  return (
    <div
      className="calendarWrapper"
      style={{
        maxWidth: pageDates.length * 200,
        gridTemplateColumns: `auto repeat(${pageDates.length}, 1fr)`,
        gridTemplateRows:
          minutesPerCell < 60
            ? `auto auto repeat(${numRows + 1}, 1em) auto`
            : `auto auto repeat(${numRows + 1}, 1.5em)`,
      }}
    >
      <div className="pageButtonWrapper">
        {currentPage > 0 ? (
          <button className="pageButton pageLeft" onClick={() => setCurrentPage((currentPage) => currentPage - 1)}>
            <ArrowLeftIcon className="pageIcon" />
          </button>
        ) : (
          <div />
        )}
        {currentPage < calculatePageStarts().length - 1 ? (
          <button className="pageButton pageRight" onClick={() => setCurrentPage((currentPage) => currentPage + 1)}>
            <ArrowRightIcon className="pageIcon" />
          </button>
        ) : (
          <div />
        )}
      </div>

      <div className="calendarBlankCell" />
      {pageDates.map((date, col) => (
        <div key={date.date} className="calendarLabel" style={extraColMargin(col)}>
          {date.day}
          <br />
          {date.date}
        </div>
      ))}

      {Array.from({ length: numRows }).map((_, row) => (
        <Fragment key={row}>
          <div className="calendarLabel calendarRowLabel">
            {getTimeIncrementLabel(row, range.start, minutesPerCell)}
          </div>
          {pageDates.map((date, col) => (
            <div key={date.date} className={calculateCellClasses(row, col)} style={extraColMargin(col)}>
              <Cell
                time={addMinutesToTime(range.start, (minutesPerCell * row) as ValidMinutes)}
                date={date}
                selectedCells={selectedCells}
                setSelectedCells={setSelectedCells}
                isPointerDown={isPointerDown}
                setIsPointerDown={setIsPointerDown}
                isEnablingCells={isEnablingCells}
                setIsEnablingCells={setIsEnablingCells}
              />
            </div>
          ))}
        </Fragment>
      ))}
      <div className="calendarLabel calendarRowLabel">{formatTime(range.end)}</div>
    </div>
  );
};

export { BaseCalendar };
