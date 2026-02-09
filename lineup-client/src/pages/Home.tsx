import { BaseCalendar, CalendarCell } from "@/components/Calendars";
import { useAuth0 } from "@auth0/auth0-react/";
import LoggedInHome from "./LoggedInHome";
import LoggedOutHome from "./LoggedOutHome";

const Home = () => {
  const { isAuthenticated, isLoading, error } = useAuth0();

  return (
    <>
      {(!isLoading || error) && <>{isAuthenticated ? <LoggedInHome /> : <LoggedOutHome />}</>}
      <BaseCalendar
        Cell={CalendarCell}
        minutesPerCell={15}
        weekdays={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]}
        range={{ start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } }}
      ></BaseCalendar>
    </>
  );
};

export default Home;
