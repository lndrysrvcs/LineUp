import { Calendar } from "@/components/Calendar";
import { FillableCell } from "@/components/CalendarCells";
import { queryClient, useApi } from "@/utils/api";
import { addToasts, loaderQuery } from "@/utils/db";
import { parseTimeString } from "@/utils/time";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

const EditAvailability = () => {
  const navigate = useNavigate();
  const { fetchWithAuth } = useApi();
  const { guid: availabilityGuid } = useParams<{ guid: string }>();
  const { data: availabilityData } = useQuery(loaderQuery("/api/availability/{}", availabilityGuid!));
  const { data: scheduleData } = useQuery(loaderQuery("/api/schedule/{}", availabilityData?.scheduleGuid ?? ""));
  const storageKey = `editAvailability-${availabilityGuid}`;

  // Locally store any information the user has entered so that the information can be prefilled if they
  // refresh the page or navigate away
  const storedForm = (() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    } catch {
      return {};
    }
  })();

  const [name, setName] = useState<string>(storedForm.name ?? "");
  const [email, setEmail] = useState<string>(storedForm.email ?? "");
  const [selectedCells, setSelectedCells] = useState<string[]>(storedForm.selectedCells ?? []);

  // Stores the given information in local storage with the given storageKey, if available
  const persistToStorage = (nextName: string, nextEmail: string, nextCells: string[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ name: nextName, email: nextEmail, selectedCells: nextCells }));
    } catch {
      // localStorage may be unavailable (e.g. private browsing quota exceeded)
    }
  };

  // Collects the user's currently known availability information to prefill the form
  // If the user has started editing the form and has any information in local storage,
  // prefills with that instead
  useEffect(() => {
    if (!availabilityData) return;

    if (!storedForm.name && !storedForm.email && !storedForm.selectedCells) {
      setTimeout(() => {
        setName(availabilityData.userName);
        setEmail(availabilityData.userEmail);
        setSelectedCells(availabilityData.availabilitySlots ?? []);
      }, 0);
    }
  }, [availabilityData]);

  type EditAvailabilityProps = {
    userName: string; // Not a 'username', but the user's input name
    userEmail: string; // The user's input email
    availabilitySlots: string[]; // full of ISO strings
  };

  // Mutation for editing an existing availability with the user's input
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (updatedAvailability: EditAvailabilityProps) => {
      const res = await fetchWithAuth(`/api/availability/${availabilityGuid}/edit`, {
        method: "PATCH",
        body: JSON.stringify(updatedAvailability),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to edit availability");
      }

      return true;
    },
    onSuccess: () => {
      // Clear the local storage for this form and invalidate the availability query, then navigate to the homepage
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // ignore storage errors
      }
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      navigate("/");
    },
  });

  // If the availability or schedule data is still loading, show a loading message
  if (!availabilityData || !scheduleData) {
    return <div>Loading...</div>;
  }

  const scheduleGenerated = scheduleData.shiftAssignments.length > 0;

  // Called when the user submits the form, calls the update availability mutation after verifying input
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (name.trim() === "" || email.trim() === "") {
      alert("You must enter a name and email with letters!");
      return;
    }

    if (selectedCells.length === 0) {
      alert("Please select at least one time slot.");
      return;
    }

    addToasts(
      updateAvailabilityMutation.mutateAsync({
        userName: name.trim(),
        userEmail: email.trim(),
        availabilitySlots: selectedCells,
      }),
    );
  };

  return (
    <div className="availabilityRoot">
      {
        // if a schedule has been generated, show a message stating so with a link to the generated schedule
        // if not, show the form to edit availability
      }
      {scheduleGenerated ? (
        <div>
          <div>Schedule already generated. Editing availability is closed</div>
          <div>
            <Link to={`/schedule/${scheduleData.guid}`} className="generatedScheduleLink">
              View Schedule
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="scheduleName">
            Edit <b>{availabilityData.userName}</b>'s availability for <b>{scheduleData.name}</b>
          </div>
          <form onSubmit={handleSubmit} className="newSchedule">
            <div className="inputGroup">
              <div>
                <label htmlFor="name" className="required">
                  Full Name
                </label>
                <br />
                <input
                  className="input"
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    persistToStorage(e.target.value, email, selectedCells);
                  }}
                  required
                />
              </div>
            </div>
            <div>
              <label className="availabilityLabel required">Availability</label>
              <Calendar
                Cell={FillableCell}
                minutesPerCell={scheduleData.schedulePreferences?.minutesPerSlot || 15}
                dates={
                  scheduleData.dateCoverage?.map((d: string) => {
                    const [year, month, day] = d.split("-").map(Number);
                    return new Date(year, month - 1, day);
                  }) ?? []
                }
                range={{
                  start: parseTimeString(scheduleData.startTime)!,
                  end: parseTimeString(scheduleData.endTime)!,
                }}
                selectedCells={selectedCells}
                setSelectedCells={(cells) => {
                  const next = typeof cells === "function" ? cells(selectedCells) : cells;
                  setSelectedCells(next);
                  persistToStorage(name, email, next);
                }}
              />
            </div>
            <div className="submitContainer">
              <button type="submit" className="submitBtn" disabled={updateAvailabilityMutation.isPending}>
                Confirm Changes
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default EditAvailability;
