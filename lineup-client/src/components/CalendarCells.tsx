import type { DateDay, Time } from "@/types";
import { formatDate, formatDateTime, formatTime } from "@/utils/time";
import React from "react";

export interface CalendarCellProps {
  time: Time;
  date: DateDay;
  selectedCells: string[];
  setSelectedCells: React.Dispatch<React.SetStateAction<string[]>>;
  isPointerDown: boolean;
  setIsPointerDown: React.Dispatch<React.SetStateAction<boolean>>;
  isEnablingCells: boolean;
  setIsEnablingCells: React.Dispatch<React.SetStateAction<boolean>>;
}

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
  const isClicked = selectedCells.includes(formatDateTime(date.date, time));

  function updateCell() {
    console.log(`Clicked on ${formatDate(date, time)}`);
    if (isClicked) {
      setSelectedCells((cells) => cells.filter((cell) => cell !== formatDateTime(date.date, time)));
    } else {
      setSelectedCells((cells) => [...cells, formatDateTime(date.date, time)]);
    }
  }

  function onPointerDown() {
    setIsPointerDown(true);
    setIsEnablingCells(!isClicked);
    updateCell();
  }

  function onPointerEnter() {
    if (isPointerDown && isClicked !== isEnablingCells) {
      updateCell();
    }
  }

  return (
    <button
      onPointerDown={onPointerDown}
      onPointerUp={() => setIsPointerDown(false)}
      onPointerEnter={onPointerEnter}
      className={"unstyledButton calendarInnerCell" + (isClicked ? " clicked" : "")}
      title={date.day + " " + formatTime(time)}
    ></button>
  );
};

export { FillableCell };
