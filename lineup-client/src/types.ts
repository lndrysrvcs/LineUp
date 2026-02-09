export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export type ValidMinutes = 0 | 15 | 20 | 30 | 40 | 45 | 60;

// prettier-ignore
export type ValidHours = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23;

export type Time = {
  hour: ValidHours;
  minute: ValidMinutes;
};

export type TimeRange = {
  start: Time;
  end: Time;
};
