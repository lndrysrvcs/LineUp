/**
 * @vitest-environment jsdom
 */
import { Calendar } from "@/components/Calendar";
import { ColoredCell, FillableCell } from "@/components/CalendarCells";
import type { ValidMinutes } from "@/types";
import { addMinutesToTime, standardizeDateAndTime } from "@/utils/time";
import "@testing-library/jest-dom/vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

describe("Calendar component", () => {
  const dates = [new Date(2026, 2, 13)]; // March 13, 2026 (Friday)

  describe("15 minute intervals", () => {
    it("should render the correct number of rows (perfectly divisible)", () => {
      const { container } = render(
        <Calendar
          Cell={ColoredCell}
          minutesPerCell={15}
          dates={dates}
          range={{
            start: { hour: 9, minute: 0 },
            end: { hour: 17, minute: 0 },
          }}
        />,
      );
      const cells = container.querySelectorAll(".calendarInnerCell");
      expect(cells).toHaveLength((17 - 9) * 4);
    });

    it("should render the correct number of rows (divisble but different minutes)", () => {
      const { container } = render(
        <Calendar
          Cell={ColoredCell}
          minutesPerCell={15}
          dates={dates}
          range={{
            start: { hour: 9, minute: 15 },
            end: { hour: 17, minute: 0 },
          }}
        />,
      );
      const cells = container.querySelectorAll(".calendarInnerCell");
      expect(cells).toHaveLength((17 - 9) * 4 - 1);
    });
  });

  describe("20 minute intervals", () => {
    it("should render the correct number of rows (perfectly divisible)", () => {
      const { container } = render(
        <Calendar
          Cell={ColoredCell}
          minutesPerCell={20}
          dates={dates}
          range={{
            start: { hour: 9, minute: 0 },
            end: { hour: 17, minute: 0 },
          }}
        />,
      );
      const cells = container.querySelectorAll(".calendarInnerCell");
      expect(cells).toHaveLength((17 - 9) * 3);
    });

    it("should render the correct number of rows (divisble but different minutes)", () => {
      const { container } = render(
        <Calendar
          Cell={ColoredCell}
          minutesPerCell={20}
          dates={dates}
          range={{
            start: { hour: 9, minute: 20 },
            end: { hour: 17, minute: 0 },
          }}
        />,
      );
      const cells = container.querySelectorAll(".calendarInnerCell");
      expect(cells).toHaveLength((17 - 9) * 3 - 1);
    });
  });

  describe("30 minute intervals", () => {
    it("should render the correct number of rows (perfectly divisible)", () => {
      const { container } = render(
        <Calendar
          Cell={ColoredCell}
          minutesPerCell={30}
          dates={dates}
          range={{
            start: { hour: 9, minute: 0 },
            end: { hour: 17, minute: 0 },
          }}
        />,
      );
      const cells = container.querySelectorAll(".calendarInnerCell");
      expect(cells).toHaveLength((17 - 9) * 2);
    });

    it("should render the correct number of rows (divisble but different minutes)", () => {
      const { container } = render(
        <Calendar
          Cell={ColoredCell}
          minutesPerCell={30}
          dates={dates}
          range={{
            start: { hour: 9, minute: 30 },
            end: { hour: 17, minute: 0 },
          }}
        />,
      );
      const cells = container.querySelectorAll(".calendarInnerCell");
      expect(cells).toHaveLength((17 - 9) * 2 - 1);
    });

    it("should render the correct number of rows (not divisible)", () => {
      const { container } = render(
        <Calendar
          Cell={ColoredCell}
          minutesPerCell={30}
          dates={dates}
          range={{
            start: { hour: 9, minute: 15 },
            end: { hour: 17, minute: 0 },
          }}
        />,
      );
      const cells = container.querySelectorAll(".calendarInnerCell");
      expect(cells).toHaveLength((17 - 9) * 2);
    });
  });

  describe("40 minute intervals", () => {
    it("should render the correct number of rows (perfectly divisible)", () => {
      const { container } = render(
        <Calendar
          Cell={ColoredCell}
          minutesPerCell={40}
          dates={dates}
          range={{
            start: { hour: 9, minute: 0 },
            end: { hour: 17, minute: 0 },
          }}
        />,
      );
      const cells = container.querySelectorAll(".calendarInnerCell");
      expect(cells).toHaveLength(((17 - 9) * 60) / 40);
    });

    it("should render the correct number of rows (divisble but different minutes)", () => {
      const { container } = render(
        <Calendar
          Cell={ColoredCell}
          minutesPerCell={40}
          dates={dates}
          range={{
            start: { hour: 9, minute: 40 },
            end: { hour: 17, minute: 0 },
          }}
        />,
      );
      const cells = container.querySelectorAll(".calendarInnerCell");
      expect(cells).toHaveLength(((17 - 9) * 60) / 40 - 1);
    });

    it("should render the correct number of rows (not divisible)", () => {
      const { container } = render(
        <Calendar
          Cell={ColoredCell}
          minutesPerCell={40}
          dates={dates}
          range={{
            start: { hour: 9, minute: 20 },
            end: { hour: 17, minute: 0 },
          }}
        />,
      );
      const cells = container.querySelectorAll(".calendarInnerCell");
      expect(cells).toHaveLength(((17 - 9) * 60) / 40);
    });
  });

  describe("45 minute intervals", () => {
    it("should render the correct number of rows (perfectly divisible)", () => {
      const { container } = render(
        <Calendar
          Cell={ColoredCell}
          minutesPerCell={45}
          dates={dates}
          range={{
            start: { hour: 9, minute: 0 },
            end: { hour: 18, minute: 0 },
          }}
        />,
      );
      const cells = container.querySelectorAll(".calendarInnerCell");
      expect(cells).toHaveLength(((18 - 9) * 60) / 45);
    });

    it("should render the correct number of rows (divisble but different minutes)", () => {
      const { container } = render(
        <Calendar
          Cell={ColoredCell}
          minutesPerCell={45}
          dates={dates}
          range={{
            start: { hour: 9, minute: 45 },
            end: { hour: 18, minute: 0 },
          }}
        />,
      );
      const cells = container.querySelectorAll(".calendarInnerCell");
      expect(cells).toHaveLength(((18 - 9) * 60) / 45 - 1);
    });

    it("should render the correct number of rows (not divisible)", () => {
      const { container } = render(
        <Calendar
          Cell={ColoredCell}
          minutesPerCell={45}
          dates={dates}
          range={{
            start: { hour: 9, minute: 15 },
            end: { hour: 18, minute: 0 },
          }}
        />,
      );
      const cells = container.querySelectorAll(".calendarInnerCell");
      expect(cells).toHaveLength(((18 - 9) * 60) / 45);
    });
  });

  describe("60 minute intervals", () => {
    it("should render the correct number of rows (perfectly divisible)", () => {
      const { container } = render(
        <Calendar
          Cell={ColoredCell}
          minutesPerCell={60}
          dates={dates}
          range={{
            start: { hour: 9, minute: 0 },
            end: { hour: 17, minute: 0 },
          }}
        />,
      );
      const cells = container.querySelectorAll(".calendarInnerCell");
      expect(cells).toHaveLength(17 - 9);
    });

    it("should render the correct number of rows (not divisible)", () => {
      const { container } = render(
        <Calendar
          Cell={ColoredCell}
          minutesPerCell={60}
          dates={dates}
          range={{
            start: { hour: 9, minute: 15 },
            end: { hour: 17, minute: 0 },
          }}
        />,
      );
      const cells = container.querySelectorAll(".calendarInnerCell");
      expect(cells).toHaveLength(17 - 9);
    });
  });

  describe("24 hours", () => {
    it("should render the correct number of rows", () => {
      const { container } = render(
        <Calendar
          Cell={ColoredCell}
          minutesPerCell={15}
          dates={dates}
          range={{
            start: { hour: 0, minute: 0 },
            end: { hour: 0, minute: 0 },
          }}
        />,
      );
      const cells = container.querySelectorAll(".calendarInnerCell");
      expect(cells).toHaveLength(24 * 4);

      const pageButtons = container.querySelectorAll(".pageButton");
      expect(pageButtons).toHaveLength(0);
    });
  });

  describe("Multiple days", () => {
    it("should render the correct number of columns with correct titles", () => {
      const moreDates = [new Date(2026, 2, 13), new Date(2026, 2, 14), new Date(2026, 2, 15)];
      const { container } = render(
        <Calendar
          Cell={ColoredCell}
          minutesPerCell={30}
          dates={moreDates}
          range={{
            start: { hour: 9, minute: 0 },
            end: { hour: 17, minute: 0 },
          }}
        />,
      );
      const cells = container.querySelectorAll(".calendarLabel:not(.calendarRowLabel)");
      expect(cells).toHaveLength(moreDates.length);
      expect(cells[0]).toHaveTextContent("Friday3/13"); // looks weird because of the <br /> which it ignores
      expect(cells[1]).toHaveTextContent("Saturday3/14");
      expect(cells[2]).toHaveTextContent("Sunday3/15");
    });

    it("should add a gap between non-consecutive days", () => {
      const moreDates = [new Date(2026, 2, 13), new Date(2026, 2, 15), new Date(2026, 2, 16)];
      const { container } = render(
        <Calendar
          Cell={ColoredCell}
          minutesPerCell={30}
          dates={moreDates}
          range={{
            start: { hour: 9, minute: 0 },
            end: { hour: 17, minute: 0 },
          }}
        />,
      );
      const cells = container.querySelectorAll(".calendarLabel:not(.calendarRowLabel)");
      const cell1Style = window.getComputedStyle(cells[0]);
      const cell2Style = window.getComputedStyle(cells[1]);
      const cell3Style = window.getComputedStyle(cells[2]);
      expect(cell1Style.marginLeft).toBe("");
      expect(cell1Style.marginRight).not.toBe("");
      expect(cell2Style.marginLeft).not.toBe("");
      expect(cell2Style.marginRight).toBe("");
      expect(cell3Style.marginLeft).toBe("");
      expect(cell3Style.marginRight).toBe("");
    });

    it("should paginate if there are more than 7 days", async () => {
      const moreDates = [
        new Date(2026, 2, 7), // Saturday
        new Date(2026, 2, 8),
        new Date(2026, 2, 9),
        new Date(2026, 2, 10),
        new Date(2026, 2, 11),
        new Date(2026, 2, 12),
        new Date(2026, 2, 13),
        new Date(2026, 2, 14),
        new Date(2026, 2, 15),
      ]; // Sunday (3 pages since weeks start on Sundays)
      const { container } = render(
        <Calendar
          Cell={ColoredCell}
          minutesPerCell={30}
          dates={moreDates}
          range={{
            start: { hour: 9, minute: 0 },
            end: { hour: 17, minute: 0 },
          }}
        />,
      );
      let cells = container.querySelectorAll(".calendarLabel:not(.calendarRowLabel)");
      expect(cells).toHaveLength(1);

      let pageButtons = container.querySelectorAll(".pageButton");
      expect(pageButtons).toHaveLength(1);

      await userEvent.click(pageButtons[0]); // right
      cells = container.querySelectorAll(".calendarLabel:not(.calendarRowLabel)");
      expect(cells).toHaveLength(7);

      pageButtons = container.querySelectorAll(".pageButton");
      expect(pageButtons).toHaveLength(2);

      await userEvent.click(pageButtons[1]); // right
      cells = container.querySelectorAll(".calendarLabel:not(.calendarRowLabel)");
      expect(cells).toHaveLength(1);

      pageButtons = container.querySelectorAll(".pageButton");
      expect(pageButtons).toHaveLength(1);

      await userEvent.click(pageButtons[0]); // left
      cells = container.querySelectorAll(".calendarLabel:not(.calendarRowLabel)");
      expect(cells).toHaveLength(7);
    });
  });

  describe("Column toggling", () => {
    it("should enable all cells in a column when a label is clicked", async () => {
      const setSelectedCells = vi.fn();

      const { container } = render(
        <Calendar
          Cell={FillableCell}
          minutesPerCell={30}
          dates={dates}
          range={{
            start: { hour: 9, minute: 0 },
            end: { hour: 17, minute: 0 },
          }}
          setSelectedCells={setSelectedCells}
        />,
      );
      const cells = container.querySelectorAll(".calendarInnerCell");
      [...cells].forEach((cell) => {
        expect(cell).not.toHaveClass("clicked");
      });
      expect(setSelectedCells).not.toHaveBeenCalled();

      const labelButtons = container.querySelectorAll("button.calendarLabel");
      await userEvent.click(labelButtons[0]);

      const setSelectedCellsUpdater = setSelectedCells.mock.calls[0][0];
      expect(setSelectedCellsUpdater([])).toHaveLength(16); // one for every row
    });

    it("should only toggle disabled cells if they exist", async () => {
      const setSelectedCells = vi.fn();

      const { container } = render(
        <Calendar
          Cell={FillableCell}
          minutesPerCell={30}
          dates={dates}
          range={{
            start: { hour: 9, minute: 0 },
            end: { hour: 17, minute: 0 },
          }}
          selectedCells={[standardizeDateAndTime(dates[0], { hour: 9, minute: 0 })]}
          setSelectedCells={setSelectedCells}
        />,
      );
      const cells = container.querySelectorAll(".calendarInnerCell");
      [...cells].forEach((cell, i) => {
        if (i === 0) {
          expect(cell).toHaveClass("clicked");
        } else {
          expect(cell).not.toHaveClass("clicked");
        }
      });
      expect(setSelectedCells).not.toHaveBeenCalled();

      const labelButtons = container.querySelectorAll("button.calendarLabel");
      await userEvent.click(labelButtons[0]);

      const setSelectedCellsUpdater = setSelectedCells.mock.calls[0][0];
      expect(setSelectedCellsUpdater([])).toHaveLength(16); // one for every row, not removing the one already selected
    });

    it("should disable all cells if they're all selected", async () => {
      const setSelectedCells = vi.fn();
      const allCells = Array.from({ length: 16 }, (_, i) =>
        standardizeDateAndTime(dates[0], addMinutesToTime({ hour: 9, minute: 0 }, (i * 30) as ValidMinutes)),
      );

      const { container } = render(
        <Calendar
          Cell={FillableCell}
          minutesPerCell={30}
          dates={dates}
          range={{
            start: { hour: 9, minute: 0 },
            end: { hour: 17, minute: 0 },
          }}
          selectedCells={allCells}
          setSelectedCells={setSelectedCells}
        />,
      );
      const cells = container.querySelectorAll(".calendarInnerCell");
      [...cells].forEach((cell) => {
        expect(cell).toHaveClass("clicked");
      });
      expect(setSelectedCells).not.toHaveBeenCalled();

      const labelButtons = container.querySelectorAll("button.calendarLabel");
      await userEvent.click(labelButtons[0]);

      const setSelectedCellsUpdater = setSelectedCells.mock.calls[0][0];
      expect(setSelectedCellsUpdater(allCells)).toHaveLength(0);
    });
  });

  it("should set cells as focused when hovering over them", async () => {
    const setFocusedCell = vi.fn();
    const { container } = render(
      <Calendar
        Cell={ColoredCell}
        minutesPerCell={30}
        dates={dates}
        range={{
          start: { hour: 9, minute: 0 },
          end: { hour: 17, minute: 0 },
        }}
        setFocusedCell={setFocusedCell}
      />,
    );
    const cells = container.querySelectorAll(".calendarInnerCell");
    expect(setFocusedCell).not.toHaveBeenCalled();

    await userEvent.hover(cells[1]);
    expect(setFocusedCell).toHaveBeenCalledWith(standardizeDateAndTime(dates[0], { hour: 9, minute: 30 }));

    await userEvent.unhover(cells[1]);
    expect(setFocusedCell).toHaveBeenCalledWith(null);
  });
});
