import type { Time } from "@/types";
import { dayNumberToWeekday, formatTime, standardizeDateAndTime } from "@/utils/time";
import React from "react";

export interface CalendarCellProps {
  time: Time;
  date: Date;
  selectedCells?: string[];
  setSelectedCells?: React.Dispatch<React.SetStateAction<string[]>>;
  selectableCells?: string[];
  isPointerDown: boolean;
  setIsPointerDown: React.Dispatch<React.SetStateAction<boolean>>;
  isEnablingCells: boolean;
  setIsEnablingCells: React.Dispatch<React.SetStateAction<boolean>>;
  colors: { [key: string]: string };
  text: { [key: string]: string };
}

// A cell type that can be selected/deselected to indicate availability
const FillableCell = ({
  time,
  date,
  selectedCells,
  setSelectedCells,
  selectableCells,
  isPointerDown,
  setIsPointerDown,
  isEnablingCells,
  setIsEnablingCells,
  text,
  colors,
}: CalendarCellProps) => {
  const dateString = standardizeDateAndTime(date, time);
  const isClicked = selectedCells?.includes(dateString);

  // Toggle whether this cell is selected
  function updateCell() {
    if (isClicked) {
      setSelectedCells?.((cells) => cells.filter((cell) => cell !== dateString));
    } else {
      setSelectedCells?.((cells) => [...cells, dateString]);
    }
  }

  // When the pointer goes down, track whether or not we are enabling cells for a sweeping selection
  function onPointerDown() {
    setIsPointerDown(true);
    setIsEnablingCells(!isClicked);
    updateCell();
  }

  // Used for tracking sweeping across multiple cells to select/deselect them without individually clicking each one
  function onPointerEnter() {
    if (isPointerDown && isClicked !== isEnablingCells) {
      updateCell();
    }
  }

  const lastProcessedCell = React.useRef<string | null>(null);

  function onPointerMove(e: React.PointerEvent) {
    if (!isPointerDown) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const button = el?.closest<HTMLElement>("[data-cell-key]");
    if (!button || button === e.currentTarget) return;
    const cellKey = button.dataset.cellKey!;
    if (cellKey === lastProcessedCell.current) return;
    lastProcessedCell.current = cellKey;
    const isSelected = selectedCells?.includes(cellKey);
    if (isSelected !== isEnablingCells) {
      setSelectedCells?.((cells) => (isEnablingCells ? [...cells, cellKey] : cells.filter((c) => c !== cellKey)));
    }
  }

  return (
    <button
      type="button"
      data-cell-key={dateString}
      onPointerDown={onPointerDown}
      onPointerUp={() => setIsPointerDown(false)}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      className={"unstyledButton calendarInnerCell" + (isClicked ? " clicked" : "")}
      style={{ backgroundColor: !isClicked ? (colors[dateString] ?? "transparent") : undefined }}
      disabled={!selectableCells?.includes(dateString)}
      title={dayNumberToWeekday(date.getDay()) + " " + formatTime(time)}
    >
      {text[dateString] ?? ""}
    </button>
  );
};

// A cell type that is colored based on the provided input and includes text information, but cannot be clicked
// Used for displaying the generated schedule with the proper shift assignments, sorted by color
const ColoredCell = ({ time, date, colors, text }: CalendarCellProps) => {
  const dateString = standardizeDateAndTime(date, time);

  return (
    <div
      className={"calendarInnerCell"}
      style={{ backgroundColor: colors[dateString] ?? "transparent" }}
      aria-label={dayNumberToWeekday(date.getDay()) + " " + formatTime(time)}
    >
      {text[dateString] ?? ""}
    </div>
  );
};

export { ColoredCell, FillableCell };
