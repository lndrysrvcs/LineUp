/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import type { Time } from "../types";
import {
  addMinutesToTime,
  addTimeToDate,
  dayNumberToWeekday,
  formatDate,
  formatTime,
  formatTimeForInput,
  getTimeIncrementLabel,
  getValidMinutesForInterval,
  parseTimeString,
  rangeIs24Hours,
  timesAreEqual,
  toMinutes,
  weekdayToNum,
} from "../utils/time";

describe("addMinutesToTime", () => {
  it("adds minutes within same hour", () => {
    expect(addMinutesToTime({ hour: 10, minute: 15 }, 15)).toEqual({ hour: 10, minute: 30 });
  });

  it("rolls over to next hour", () => {
    expect(addMinutesToTime({ hour: 10, minute: 40 }, 40)).toEqual({ hour: 11, minute: 20 });
  });

  it("wraps around midnight", () => {
    expect(addMinutesToTime({ hour: 23, minute: 40 }, 40)).toEqual({ hour: 0, minute: 20 });
  });
});

describe("addTimeToDate", () => {
  it("adds time to a date", () => {
    const date = new Date("2024-01-01T00:00:00");
    const result = addTimeToDate(date, { hour: 9, minute: 30 });

    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(30);
  });
});

describe("weekday conversions", () => {
  it("converts weekday to number and back", () => {
    const num = weekdayToNum("Monday");
    const day = dayNumberToWeekday(num);
    expect(day).toBe("Monday");

    const num2 = weekdayToNum("Sunday");
    const day2 = dayNumberToWeekday(num2);
    expect(day2).toBe("Sunday");
  });
});

describe("formatDate", () => {
  it("formats date and time together", () => {
    const date = new Date("2024-01-01T00:00:00");
    const result = formatDate(date, { hour: 9, minute: 15 });
    expect(result).toContain("09:15 AM");
  });
});

describe("formatTime", () => {
  it("formats AM time correctly", () => {
    expect(formatTime({ hour: 9, minute: 15 })).toBe("09:15 AM");
  });

  it("formats PM time correctly", () => {
    expect(formatTime({ hour: 17, minute: 30 })).toBe("05:30 PM");
  });

  it("formats midnight as 12 AM", () => {
    expect(formatTime({ hour: 0, minute: 0 })).toBe("12:00 AM");
  });

  it("formats noon as PM", () => {
    expect(formatTime({ hour: 12, minute: 0 })).toBe("12:00 PM");
  });
});

describe("formatTimeForInput", () => {
  it("formats time in 24h format", () => {
    expect(formatTimeForInput({ hour: 9, minute: 15 })).toBe("09:15");
    expect(formatTimeForInput({ hour: 17, minute: 30 })).toBe("17:30");
  });
});

describe("getTimeIncrementLabel", () => {
  const start = { hour: 9, minute: 0 } as Time;

  it("returns label for first row", () => {
    expect(getTimeIncrementLabel(0, start, 30)).toBe("09:00 AM");
  });

  it("returns label for third row with minutesPerCell set to 30", () => {
    expect(getTimeIncrementLabel(2, start, 30)).toBe("10:00 AM");
  });

  it("returns empty string when not a labeled increment", () => {
    expect(getTimeIncrementLabel(1, start, 30)).toBe("");
  });

  it("returns label when minutesPerCell is 60", () => {
    expect(getTimeIncrementLabel(3, start, 60)).toBe("12:00 PM");
  });

  it("returns label when minutesPerCell is 45", () => {
    expect(getTimeIncrementLabel(2, start, 45)).toBe("10:30 AM");
  });

  it("returns label when minutesPerCell is 40", () => {
    expect(getTimeIncrementLabel(3, start, 40)).toBe("11:00 AM");
  });

  it("returns label when minutesPerCell is 15", () => {
    expect(getTimeIncrementLabel(2, start, 15)).toBe("09:30 AM");
  });

  const start2 = { hour: 9, minute: 15 } as Time;
  it("returns label when minutesPerCell is 30 and starts at a 15 minute offset", () => {
    expect(getTimeIncrementLabel(2, start2, 30)).toBe("10:15 AM");
  });

  it("returns label when minutesPerCell is 60 and minutes are not 0", () => {
    expect(getTimeIncrementLabel(1, start2, 60)).toBe("10:15 AM");
  });
});

describe("getValidMinutesForInterval", () => {
  it("returns 15-minute increments", () => {
    expect(getValidMinutesForInterval(15)).toEqual([0, 15, 30, 45]);
  });

  it("returns 20-minute increments", () => {
    expect(getValidMinutesForInterval(20)).toEqual([0, 20, 40]);
  });

  it("returns 30 minute increments", () => {
    expect(getValidMinutesForInterval(30)).toEqual([0, 15, 30, 45]);
  });

  it("returns 40 minute increments", () => {
    expect(getValidMinutesForInterval(40)).toEqual([0, 20, 40]);
  });

  it("returns 45 minute increments", () => {
    expect(getValidMinutesForInterval(45)).toEqual([0, 15, 30, 45]);
  });

  it("returns 60 minute increments", () => {
    expect(getValidMinutesForInterval(60)).toEqual([0, 15, 20, 30, 40, 45]);
  });

  it("returns default values for unknown interval", () => {
    expect(getValidMinutesForInterval(999)).toEqual([0, 15, 20, 30, 40, 45]);
  });
});

describe("parseTimeString", () => {
  it("parses valid time string", () => {
    expect(parseTimeString("17:30")).toEqual({ hour: 17, minute: 30 });
  });

  it("returns null for invalid format", () => {
    expect(parseTimeString("invalid")).toBeNull();
  });

  it("returns null for NaN values", () => {
    expect(parseTimeString("aa:bb")).toBeNull();
  });
});

describe("rangeIs24Hours", () => {
  it("returns true for full-day range", () => {
    expect(
      rangeIs24Hours({
        start: { hour: 0, minute: 0 },
        end: { hour: 0, minute: 0 },
      }),
    ).toBe(true);
  });

  it("returns false for partial range within 12-1 AM", () => {
    expect(
      rangeIs24Hours({
        start: { hour: 0, minute: 0 },
        end: { hour: 0, minute: 15 },
      }),
    ).toBe(false);
  });

  it("returns false for partial range", () => {
    expect(
      rangeIs24Hours({
        start: { hour: 9, minute: 0 },
        end: { hour: 17, minute: 0 },
      }),
    ).toBe(false);
  });
});

describe("timesAreEqual", () => {
  it("returns true for identical times", () => {
    expect(timesAreEqual({ hour: 9, minute: 15 }, { hour: 9, minute: 15 })).toBe(true);
  });

  it("returns false for different times", () => {
    expect(timesAreEqual({ hour: 9, minute: 15 }, { hour: 17, minute: 30 })).toBe(false);
  });
});

describe("toMinutes", () => {
  it("converts time to minutes", () => {
    expect(toMinutes({ hour: 1, minute: 30 })).toBe(90);
  });

  it("allows midnight as end time", () => {
    expect(toMinutes({ hour: 0, minute: 0 }, true)).toBe(1440);
  });
});
