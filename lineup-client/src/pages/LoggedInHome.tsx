import CopyableLink from "@/components/CopyableLink";
import Table from "@/components/Table";
import { useApi } from "@/utils/api";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

interface TableData {
  name: string; // The name of the schedule
  respondents: number; // The current number of respondents to the schedule
  isGenerated: boolean; // Whether or not the schedule has been generated
  guid: string; // The schedule's guid, used for constructing links
}

// Schedule table headers
const headers = ["Name", "Responses", "Availability Link", "Generated?", "Schedule"];

const LoggedInHome = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const { fetchWithAuth } = useApi();

  // Retrieve the manager's schedules to display in a table on their homepage
  // If the fetch fails, show an error toast
  const {
    data: schedules,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["schedules", "allSchedules"],
    queryFn: () =>
      fetchWithAuth("/api/schedule").then(async (res) => {
        if (!res.ok) {
          toast.error(<b>Failed to fetch schedules</b>, { id: "fetch-schedules-error", duration: Infinity });
          throw new Error("Failed to fetch schedules");
        }

        const resJson = await res.json();
        toast.dismiss("fetch-schedules-error");
        return resJson.map((schedule: { name: string; respondents: number; isGenerated: boolean; guid: string }) => ({
          name: schedule.name,
          respondents: schedule.respondents ?? 0,
          isGenerated: schedule.isGenerated ?? false,
          guid: schedule.guid,
        }));
      }),
  });

  // Used to render each row of the schedule table
  // Includes name, number of respondents, a copyable link to the availability form, whether or not the
  // schedule has been generated, and a button to view/edit the schedule
  const renderRow = (row: TableData) => (
    <>
      <td className="tableShrinkCol">{row.name}</td>
      <td className="tableShrinkCol">{row.respondents}</td>
      <td>
        <CopyableLink
          url={`${globalThis.location.origin}/schedule/${row.guid}`}
          display={`${globalThis.location.hostname}/schedule/${row.guid}`}
        />
      </td>
      <td className="tableShrinkCol">{row.isGenerated ? "Yes" : "No"}</td>
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

  // Show a loading toast while fetching schedules, and an error toast if the fetch fails
  useEffect(() => {
    if (!schedules) {
      toast.loading("Fetching schedules...", { id: "fetch-schedules-error", duration: Infinity });
    }
    if (error) {
      toast.error(<b>Failed to fetch schedules</b>, { id: "fetch-schedules-error", duration: Infinity });
      console.error(error);
    }
  }, [error, schedules]);

  return (
    <div className="home">
      Welcome back, <b>{user?.given_name}</b>!
      {!isLoading && !isError && (
        <>
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
          <div className="tableWrapper">
            {schedules.length > 0 ? (
              <Table
                headers={headers}
                data={schedules}
                renderRow={renderRow}
                columnWidths={["25%", "15%", "", "16%", "13.5%"]}
              />
            ) : (
              <div>You don't have any schedules yet! Click "New Schedule" to create your first one.</div>
            )}{" "}
          </div>
        </>
      )}
    </div>
  );
};

export default LoggedInHome;
