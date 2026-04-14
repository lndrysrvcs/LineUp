import { Calendar } from "@/components/Calendar";
import { ColoredCell, FillableCell } from "@/components/CalendarCells";
import { MousePopup } from "@/components/MousePopup";
import { queryClient, useApi } from "@/utils/api";
import { addToasts, unauthorizedLoaderQuery } from "@/utils/db";
import { parseTimeString } from "@/utils/time";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

const Availability = () => {
  const navigate = useNavigate();
  const { fetchWithAuth } = useApi();
  const { guid } = useParams();
  const { data } = useQuery(unauthorizedLoaderQuery("/api/schedule/{}", guid!));
  const [focusedTime, setFocusedTime] = useState<string | null>(null);
  const storageKey = `availability-${guid}`;
  const backgroundColors = Array.from({ length: 10 }, (_, i) => `hsl(${Math.round((360 / 10) * i)}, 100%, 80%)`);

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

  type CreateAvailabilityProps = {
    userName: string; // Not a 'username', but the user's input name
    userEmail: string; // The user's input email
    availabilitySlots: string[]; // full of ISO strings
  };

  // Mutation for creating a new availability from the user's input
  const createAvailabilityMutation = useMutation({
    mutationFn: async (newAvailability: CreateAvailabilityProps) => {
      const res = await fetchWithAuth(`/api/schedule/${guid}/createAvailability`, {
        method: "POST",
        body: JSON.stringify(newAvailability),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("Someone with this name has already submitted availability!");
        } else if (res.status === 422) {
          throw new Error("Someone with this email has already submitted availability!");
        } else {
          throw new Error("Failed to create availability");
        }
      }

      return res;
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

  // If the data is still loading, show a loading message
  if (!data) return <div>Loading...</div>;

  const scheduleGenerated = data.shiftAssignments.length > 0;
  const [assignmentColors, assignmentText] = mapAssignments();

  // Maps the shift assignments to colors and text for displaying on the generated schedule
  // Assigns unique colors to each unique combination of people assigned to a shift
  function mapAssignments() {
    const colors: { [key: string]: string } = {};
    const text: { [key: string]: string } = {};
    const nameToColor: { [key: string]: string } = {};

    if (!scheduleGenerated) {
      return [colors, text];
    }

    for (const availability of data.shiftAssignments) {
      if (availability.startTime in text) {
        text[availability.startTime] = text[availability.startTime] + ", " + availability.userName;
      } else {
        text[availability.startTime] = availability.userName;
      }
    }

    let numColors = 0;
    for (const time of Object.keys(text)) {
      if (text[time] in nameToColor) {
        colors[time] = nameToColor[text[time]];
      } else {
        nameToColor[text[time]] = backgroundColors[numColors % backgroundColors.length];
        colors[time] = backgroundColors[numColors % backgroundColors.length];
        numColors++;
      }
    }
    return [colors, text];
  }

  // Called when the user submits the form, calls the create availability mutation after verifying input
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
      createAvailabilityMutation.mutateAsync({
        userName: name.trim(),
        userEmail: email.trim(),
        availabilitySlots: selectedCells,
      }),
    );
  };

  return (
    <div className="availabilityRoot">
      {
        // if a schedule has been generated, show the generated schedule
        // if not, show the form to add availability
      }
      <title>{data.name + " - LineUp"}</title>
      {scheduleGenerated ? (
        <>
          <div className="scheduleName">
            Schedule for <b>{data.name}</b>
          </div>
          <div>
            <em>New submissions are no longer being accepted.</em>
          </div>
          <br />
          <Calendar
            Cell={ColoredCell}
            minutesPerCell={data.schedulePreferences?.minutesPerSlot || 15}
            dates={
              data.dateCoverage?.map((d: string) => {
                const [year, month, day] = d.split("-").map(Number);
                return new Date(year, month - 1, day);
              }) ?? []
            }
            range={{
              start: parseTimeString(data.startTime)!,
              end: parseTimeString(data.endTime)!,
            }}
            colors={assignmentColors}
            text={assignmentText}
            setFocusedCell={setFocusedTime}
          />
          <MousePopup isOpen={focusedTime !== null && focusedTime in assignmentText} width={250}>
            <div className="availablePeoplePopupRoot">
              <div className="availablePeoplePopupHeader">{focusedTime && assignmentText[focusedTime]}</div>
              {focusedTime && (
                <div className="availablePeoplePopupTime">
                  {new Intl.DateTimeFormat("en-US", {
                    weekday: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "UTC",
                  }).format(new Date(focusedTime))}
                </div>
              )}
            </div>
          </MousePopup>
        </>
      ) : (
        <>
          <div className="scheduleName">
            Add availability for <b>{data.name}</b>
          </div>
          <form onSubmit={handleSubmit} className="scheduleForm">
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
                  name="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    persistToStorage(e.target.value, email, selectedCells);
                  }}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="required">
                  Email
                </label>
                <br />
                <input
                  className="input"
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    persistToStorage(name, e.target.value, selectedCells);
                  }}
                  required
                />
              </div>
            </div>
            <div>
              <label className="availabilityLabel required">Availability</label>
              <Calendar
                Cell={FillableCell}
                minutesPerCell={data.schedulePreferences?.minutesPerSlot || 15}
                dates={
                  data.dateCoverage?.map((d: string) => {
                    const [year, month, day] = d.split("-").map(Number);
                    return new Date(year, month - 1, day);
                  }) ?? []
                }
                range={{
                  start: parseTimeString(data.startTime)!,
                  end: parseTimeString(data.endTime)!,
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
              <button type="submit" className="submitBtn" disabled={createAvailabilityMutation.isPending}>
                Submit
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default Availability;
