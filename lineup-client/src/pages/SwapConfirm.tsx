import { Calendar } from "@/components/Calendar";
import { FillableCell } from "@/components/CalendarCells";
import type { DateDay } from "@/types";
import { useAuth0 } from "@auth0/auth0-react/";
import LoggedInHome from "./LoggedInHome";
import LoggedOutHome from "./LoggedOutHome";
import type { ShiftAssignment } from "@/api-client";

const SwapConfirm = () => {
  const testDates = [
    { date: "2/9", day: "Monday" },
    { date: "2/10", day: "Tuesday" },
    { date: "2/11", day: "Wednesday" },
    { date: "2/12", day: "Thursday" },
    { date: "2/13", day: "Friday" },
    { date: "2/15", day: "Sunday" },
    { date: "2/16", day: "Monday" },
    { date: "2/17", day: "Tuesday" },
    { date: "2/18", day: "Wednesday" },
  ] as DateDay[];
  const fromPartyA = [] as ShiftAssignment[];
  const fromPartyB = [] as ShiftAssignment[];

  return (
    <>
      <div>so, did ya want to swap or what?</div>
    </>
  );
};

export default SwapConfirm;
