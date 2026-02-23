import CopyableLink from "@/components/CopyableLink";
import Table from "@/components/Table";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router";

interface TableData {
  name: string;
  respondents: number;
  link: string;
}

// Example data for now, will need to reference user data for actual entries
const items: TableData[] = [
  {
    name: "Club Tabling",
    respondents: 18,
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    name: "Radio Shows",
    respondents: 24,
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
];

const headers = ["Name", "Respondents", "Availability Link", "Schedule"];

const renderRow = (row: TableData) => (
  <>
    <td>{row.name}</td>
    <td>{row.respondents}</td>
    <td>
      <CopyableLink url={row.link} />
    </td>
    <td className="btnCol">
      <button
        className="scheduleBtn"
        onClick={() => {
          // TODO: make this actually go to the appropriate schedule
        }}
      >
        View/Edit
      </button>
    </td>
  </>
);

const LoggedInHome = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();

  return (
    <div className="home">
      Welcome back, <b>{user?.given_name}</b>!
      <div className="tableHeader">
        <b className="tableTitle">My Schedules </b>
        <button
          className="rightButton"
          onClick={() => {
            navigate("/newschedule");
          }}
        >
          New Schedule
        </button>{" "}
      </div>
      <Table headers={headers} data={items} renderRow={renderRow} columnWidths={["25%", "25%", "30%", "20%"]} />
    </div>
  );
};

export default LoggedInHome;
