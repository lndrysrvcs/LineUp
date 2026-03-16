/**
 * @vitest-environment jsdom
 */
import { ColoredCell, FillableCell } from "@/components/CalendarCells";
import type { Time } from "@/types";
import { addTimeToDate } from "@/utils/time";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("CalendarCells component", () => {
  const time: Time = { hour: 9, minute: 15 };
  const date = new Date(2026, 2, 13); // March 13, 2026 (Friday)
  const setSelectedCells = vi.fn();
  const setIsPointerDown = vi.fn();
  const setIsEnablingCells = vi.fn();
  const colors: { [key: string]: string } = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("FillableCell", () => {
    it("has the correct title attribute", () => {
      render(
        <FillableCell
          time={time}
          date={date}
          selectedCells={[]}
          setSelectedCells={setSelectedCells}
          isPointerDown={false}
          setIsPointerDown={setIsPointerDown}
          isEnablingCells={false}
          setIsEnablingCells={setIsEnablingCells}
          colors={colors}
        />,
      );
      const cell = screen.getByRole("button");
      expect(cell).toBeInTheDocument();
      expect(cell).toHaveAttribute("title", "Friday 09:15 AM");
    });

    it("toggles state on click from untoggled", async () => {
      const user = userEvent.setup();
      render(
        <FillableCell
          time={time}
          date={date}
          selectedCells={[]}
          setSelectedCells={setSelectedCells}
          isPointerDown={false}
          setIsPointerDown={setIsPointerDown}
          isEnablingCells={false}
          setIsEnablingCells={setIsEnablingCells}
          colors={colors}
        />,
      );
      const cell = screen.getByRole("button");
      expect(cell).toBeInTheDocument();
      expect(cell).not.toHaveClass("clicked");

      await user.pointer({
        target: cell,
        keys: "[MouseLeft>]", // mousedown
      });
      expect(setIsPointerDown).toHaveBeenCalledWith(true);
      expect(setIsPointerDown).not.toHaveBeenCalledWith(false);
      expect(setIsEnablingCells).toHaveBeenCalledWith(true);

      const setSelectedCellsUpdater = setSelectedCells.mock.calls[0][0];
      expect(setSelectedCellsUpdater([])).toEqual([addTimeToDate(date, time).toISOString()]);

      await user.pointer({
        target: cell,
        keys: "[/MouseLeft]", // mouseup
      });
      expect(setIsPointerDown).toHaveBeenCalledWith(false);
    });

    it("toggles state on click from toggled", async () => {
      const user = userEvent.setup();

      render(
        <FillableCell
          time={time}
          date={date}
          selectedCells={[addTimeToDate(date, time).toISOString()]}
          setSelectedCells={setSelectedCells}
          isPointerDown={false}
          setIsPointerDown={setIsPointerDown}
          isEnablingCells={false}
          setIsEnablingCells={setIsEnablingCells}
          colors={colors}
        />,
      );
      const cell = screen.getByRole("button");
      expect(cell).toBeInTheDocument();
      expect(cell).toHaveClass("clicked");

      await user.pointer({
        target: cell,
        keys: "[MouseLeft>]", // mousedown
      });
      expect(setIsPointerDown).toHaveBeenCalledWith(true);
      expect(setIsPointerDown).not.toHaveBeenCalledWith(false);
      expect(setIsEnablingCells).toHaveBeenCalledWith(false);

      const setSelectedCellsUpdater = setSelectedCells.mock.calls[0][0];
      expect(setSelectedCellsUpdater([addTimeToDate(date, time).toISOString()])).toEqual([]);

      await user.pointer({
        target: cell,
        keys: "[/MouseLeft]", // mouseup
      });
      expect(setIsPointerDown).toHaveBeenCalledWith(false);
    });

    it("toggles state on pointer enter when pointer is down", async () => {
      const user = userEvent.setup();

      render(
        <>
          <div data-testid="outside" />
          <FillableCell
            time={time}
            date={date}
            selectedCells={[]}
            setSelectedCells={setSelectedCells}
            isPointerDown={true}
            setIsPointerDown={setIsPointerDown}
            isEnablingCells={true}
            setIsEnablingCells={setIsEnablingCells}
            colors={colors}
          />
        </>,
      );
      const cell = screen.getByRole("button");
      const outside = screen.getByTestId("outside");
      expect(cell).toBeInTheDocument();
      expect(cell).not.toHaveClass("clicked");

      await user.pointer({ target: outside });
      expect(setSelectedCells).not.toHaveBeenCalled();

      await user.pointer({ target: cell });
      expect(setSelectedCells).toHaveBeenCalled();
    });

    it("doesn't toggle state on pointer enter when pointer is not down", async () => {
      const user = userEvent.setup();

      render(
        <>
          <div data-testid="outside" />
          <FillableCell
            time={time}
            date={date}
            selectedCells={[]}
            setSelectedCells={setSelectedCells}
            isPointerDown={false}
            setIsPointerDown={setIsPointerDown}
            isEnablingCells={true}
            setIsEnablingCells={setIsEnablingCells}
            colors={colors}
          />
        </>,
      );
      const cell = screen.getByRole("button");
      const outside = screen.getByTestId("outside");
      expect(cell).toBeInTheDocument();
      expect(cell).not.toHaveClass("clicked");

      await user.pointer({ target: outside });
      await user.pointer({ target: cell });
      expect(setSelectedCells).not.toHaveBeenCalled();
    });
  });

  describe("ColoredCell", () => {
    it("has the correct label attribute", () => {
      render(
        <ColoredCell
          time={time}
          date={date}
          selectedCells={[]}
          setSelectedCells={setSelectedCells}
          isPointerDown={false}
          setIsPointerDown={setIsPointerDown}
          isEnablingCells={false}
          setIsEnablingCells={setIsEnablingCells}
          colors={colors}
        />,
      );
      const cell = screen.getByLabelText("Friday 09:15 AM");
      expect(cell).toBeInTheDocument();
    });

    it("should have no background color if it isn't in the colors list", () => {
      render(
        <ColoredCell
          time={time}
          date={date}
          selectedCells={[]}
          setSelectedCells={setSelectedCells}
          isPointerDown={true}
          setIsPointerDown={setIsPointerDown}
          isEnablingCells={true}
          setIsEnablingCells={setIsEnablingCells}
          colors={colors}
        />,
      );
      const cell = screen.getByLabelText("Friday 09:15 AM");
      expect(cell).toBeInTheDocument();
      expect(cell).toHaveStyle("background-color: rgba(0, 0, 0, 0)");
    });

    it("should have the specified background color if it is in the colors list", () => {
      const isoStringDB = addTimeToDate(date, time).toISOString().replace(".000", "");
      const actualColors: { [key: string]: string } = { [isoStringDB]: "red" };
      render(
        <ColoredCell
          time={time}
          date={date}
          selectedCells={[]}
          setSelectedCells={setSelectedCells}
          isPointerDown={true}
          setIsPointerDown={setIsPointerDown}
          isEnablingCells={true}
          setIsEnablingCells={setIsEnablingCells}
          colors={actualColors}
        />,
      );
      const cell = screen.getByLabelText("Friday 09:15 AM");
      expect(cell).toBeInTheDocument();
      expect(cell).toHaveStyle("background-color: rgb(255, 0, 0)");
    });
  });
});
