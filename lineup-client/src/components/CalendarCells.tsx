import type { Time } from "@/types";
import { dayNumberToWeekday, formatTime, standardizeDateAndTime } from "@/utils/time";
import React from "react";

export interface CalendarCellProps {
  time: Time;
  date: Date;
  selectedCells?: string[];
  setSelectedCells?: React.Dispatch<React.SetStateAction<string[]>>;
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
  isPointerDown,
  setIsPointerDown,
  isEnablingCells,
  setIsEnablingCells,
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

  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onPointerUp={() => setIsPointerDown(false)}
      onPointerEnter={onPointerEnter}
      className={"unstyledButton calendarInnerCell" + (isClicked ? " clicked" : "")}
      title={dayNumberToWeekday(date.getDay()) + " " + formatTime(time)}
    ></button>
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
