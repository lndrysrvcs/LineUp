import type { TimeRange, ValidMinutes } from "@/types";
import {
  addMinutesToTime,
  addTimeToDate,
  dayNumberToWeekday,
  formatTime,
  getTimeIncrementLabel,
  rangeIs24Hours,
} from "@/utils/time";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { Fragment, useEffect, useState } from "react";
import "./calendar.css";
import type { CalendarCellProps } from "./CalendarCells";

interface CalendarProps {
  Cell: React.ComponentType<CalendarCellProps>;
  minutesPerCell: ValidMinutes;
  dates: Date[];
  range: TimeRange;
  colors?: { [key: string]: string }; // {"2026-03-10T16:15:00.000Z": "var(--color)", ...}
  setFocusedCell?: React.Dispatch<React.SetStateAction<string | null>>;
}

// Children are each cell of the calendar
const Calendar = ({ Cell, minutesPerCell, dates, range, setFocusedCell, colors }: CalendarProps) => {
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [isEnablingCells, setIsEnablingCells] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const numRows = calculateNumRows();
  const pageDates = getPageDates(currentPage);

  function calculateNumRows() {
    if (rangeIs24Hours(range)) {
      return 24 * (60 / minutesPerCell);
    }

    return Math.ceil(
      (range.end.hour - range.start.hour) * (60 / minutesPerCell) +
        (range.end.minute - range.start.minute) / minutesPerCell,
    );
  }

  function calculatePageStarts() {
    const pageStarts = [0];
    if (dates.length <= 7) {
      return pageStarts;
    }

    for (let i = 1; i < dates.length; i++) {
      if (dates[i].getDay() <= dates[i - 1].getDay()) {
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
    } else if (minutesPerCell === 45 && (range.start.minute + minutesPerCell * row) % 30 === 0) {
      output += " calendarTopBorder";
    } else if (minutesPerCell === 45 && (range.start.minute + minutesPerCell * row) % 15 === 0) {
      output += " calendarTopBorder dottedBorder";
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

    if (pageDates[col].getDay() === 0) {
      return pageDates[col + 1].getDay() !== 1;
    } else {
      return pageDates[col].getDay() + 1 !== pageDates[col + 1].getDay();
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
          minutesPerCell < 40
            ? `auto auto repeat(${numRows + 1}, 1em) auto`
            : `auto auto repeat(${numRows + 1}, 1.5em)`,
      }}
    >
      <div className="pageButtonWrapper">
        {currentPage > 0 ? (
          <button
            type="button"
            className="pageButton pageLeft"
            onClick={() => setCurrentPage((currentPage) => currentPage - 1)}
          >
            <ArrowLeftIcon className="pageIcon" />
          </button>
        ) : (
          <div />
        )}
        {currentPage < calculatePageStarts().length - 1 ? (
          <button
            type="button"
            className="pageButton pageRight"
            onClick={() => setCurrentPage((currentPage) => currentPage + 1)}
          >
            <ArrowRightIcon className="pageIcon" />
          </button>
        ) : (
          <div />
        )}
      </div>

      <div className="calendarBlankCell" />
      {pageDates.map((date, col) => (
        <div key={date.toISOString()} className="calendarLabel" style={extraColMargin(col)}>
          {dayNumberToWeekday(date.getDay())}
          <br />
          {`${date.getMonth() + 1}/${date.getDate()}`}
        </div>
      ))}

      {Array.from({ length: numRows }).map((_, row) => (
        <Fragment key={row}>
          <div className="calendarLabel calendarRowLabel">
            {getTimeIncrementLabel(row, range.start, minutesPerCell)}
          </div>
          {pageDates.map((date, col) => (
            <div
              key={date.toISOString()}
              className={calculateCellClasses(row, col)}
              style={extraColMargin(col)}
              onPointerEnter={() =>
                setFocusedCell &&
                setFocusedCell(
                  addTimeToDate(date, addMinutesToTime(range.start, (minutesPerCell * row) as ValidMinutes))
                    .toISOString()
                    .replace(".000", ""),
                )
              }
              onPointerLeave={() => setFocusedCell && setFocusedCell(null)}
            >
              <Cell
                time={addMinutesToTime(range.start, (minutesPerCell * row) as ValidMinutes)}
                date={date}
                selectedCells={selectedCells}
                setSelectedCells={setSelectedCells}
                isPointerDown={isPointerDown}
                setIsPointerDown={setIsPointerDown}
                isEnablingCells={isEnablingCells}
                setIsEnablingCells={setIsEnablingCells}
                colors={colors ?? {}}
              />
            </div>
          ))}
        </Fragment>
      ))}
      <div className="calendarLabel calendarRowLabel">{formatTime(range.end)}</div>
      <input type="hidden" name="calendarSelected" value={selectedCells} />
    </div>
  );
};

export { Calendar };
