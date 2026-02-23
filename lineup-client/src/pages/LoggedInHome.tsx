import CopyableLink from "@/components/CopyableLink";
import Table from "@/components/Table";
import { useApi } from "@/utils/api";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";

interface TableData {
  name: string;
  respondents: number;
  guid: string;
}

const headers = ["Name", "Respondents", "Availability Link", "Schedule"];

const LoggedInHome = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const { fetchWithAuth } = useApi();

  const { data: schedules = [] } = useQuery({
    queryKey: ["schedules", "allSchedules"],
    queryFn: () =>
      fetchWithAuth("/api/schedule").then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch schedules");
        const resJson = await res.json();
        return resJson.map((schedule: any) => ({
          name: schedule.name,
          respondents: schedule.respondents ?? 0,
          guid: schedule.guid,
        }));
      }),
  });

  const renderRow = (row: TableData) => (
    <>
      <td>{row.name}</td>
      <td>{row.respondents}</td>
      <td>
        <CopyableLink url={`${globalThis.location.origin}/schedule/${row.guid}`} />
      </td>
      <td className="btnCol">
        <button
          className="scheduleBtn"
          onClick={() => {
            navigate(`/schedule/${row.guid}/edit`);
          }}
        >
          View/Edit
        </button>
      </td>
    </>
  );

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
      {schedules.length > 0 ? (
        <Table headers={headers} data={schedules} renderRow={renderRow} columnWidths={["25%", "25%", "30%", "20%"]} />
      ) : (
        <div>You don't have any schedules yet! Click "New Schedule" to create your first one.</div>
      )}
    </div>
  );
};

export default LoggedInHome;
