import { Calendar } from "@/components/Calendar";
import { ColoredCell, FillableCell } from "@/components/CalendarCells";
import { MousePopup } from "@/components/MousePopup";
import { queryClient, useApi } from "@/utils/api";
import { addToasts, loaderQuery } from "@/utils/db";
import { parseTimeString } from "@/utils/time";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

const Availability = () => {
  const navigate = useNavigate();
  const { fetchWithAuth } = useApi();
  const { guid } = useParams();
  const { data } = useQuery(loaderQuery("/api/schedule/{}", guid!));
  const [focusedTime, setFocusedTime] = useState<string | null>(null);
  const storageKey = `availability-${guid}`;
  const backgroundColors = Array.from({ length: 10 }, (_, i) => `hsl(${Math.round((360 / 10) * i)}, 100%, 80%)`);
  console.log(backgroundColors);

  console.log(data);

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

  const persistToStorage = (nextName: string, nextEmail: string, nextCells: string[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ name: nextName, email: nextEmail, selectedCells: nextCells }));
    } catch {
      // localStorage may be unavailable (e.g. private browsing quota exceeded)
    }
  };

  type CreateAvailabilityProps = {
    userName: string;
    userEmail: string;
    availabilitySlots: string[]; // full of ISO strings
  };

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
        throw new Error("Failed to create availability");
      }

      return res;
    },
    onSuccess: () => {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // ignore storage errors
      }
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      navigate("/");
    },
  });

  if (!data) return <div>Loading...</div>;

  const scheduleGenerated = data.shiftAssignments.length > 0;
  const [assignmentColors, assignmentText] = mapAssignments();

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

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (name.trim() === "" || email.trim() === "") {
      alert("You must enter a name with letters!");
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
