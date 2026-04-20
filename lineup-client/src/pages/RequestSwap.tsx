import { Calendar } from "@/components/Calendar";
import { ColoredCell, FillableCell } from "@/components/CalendarCells";
import { MousePopup } from "@/components/MousePopup";
import { useApi } from "@/utils/api";
import { addToasts, unauthorizedLoaderQuery } from "@/utils/db";
import { parseTimeString } from "@/utils/time";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

const RequestSwap = () => {
  const navigate = useNavigate();
  const { fetchWithAuth } = useApi();
  const { guid } = useParams();
  const { data } = useQuery(unauthorizedLoaderQuery("/api/schedule/{}", guid!));
  const [focusedTime, setFocusedTime] = useState<string | null>(null);
  const backgroundColors = Array.from({ length: 10 }, (_, i) => `hsl(${Math.round((360 / 10) * i)}, 100%, 80%)`);
  // console.log(backgroundColors);

  // console.log(data);

  const [email, setEmail] = useState<string>("");
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedSwapPartnerAvailabilityId, setSelectedSwapPartnerAvailabilityId] = useState<number | null>(null);
  const [selectedSwapPartner, setSelectedSwapPartner] = useState<string | null>(null);

  const confirmEmailmutation = useMutation({
    //
    mutationFn: async (email: string) => {
      const res = await fetchWithAuth(`/api/schedule/${guid}/getByEmail?email=${email}`, {
        method: "GET",
      });

      if (res.status == 406) {
        throw new Error("Availability Not Found");
      } else if (!res.ok) {
        throw new Error("Failed to send Swap Request");
      }
      const resJson = await res.json();
      return resJson;
    },
    onSuccess: (resJson) => {
      setUserId(resJson.id);
      // setSelectedCells(resJson.availabilitySlots); //This would make all the availiability light up at the start, but that feels confusing if others have shifts at that time.
    },
  });

  type CreateSwapRequestProps = {
    shiftStartTimes: string[];
    requesterId: number;
    recipientId: number | null;
  };

  const CreateSwapRequestMutation = useMutation({
    //creates a SwapRequest in the DB
    mutationFn: async (swapRequest: CreateSwapRequestProps) => {
      if (swapRequest.recipientId == null) {
        throw new Error("Failed to create Swap Request: Recipient not specified");
      }
      const res = await fetchWithAuth(`/api/schedule/${guid}/requestSwap`, {
        method: "POST",
        body: JSON.stringify(swapRequest),
        headers: {
          "Content-Type": "application/json",
        },
      });

      // console.log(JSON.stringify(swapRequest));

      if (!res.ok) {
        throw new Error("Failed to create Swap Request");
      }

      return res;
    },
    onSuccess: () => {},
  });

  if (!data) return <div>Loading...</div>;

  const scheduleGenerated = true;
  const [assignmentColors, assignmentText] = mapAssignments();
  const selectionColors = mapSelectionColors();

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

  function mapSelectionColors() {
    const colors: { [key: string]: string } = {};

    if (userId === null) {
      return colors;
    }

    return colors;

    /*
    // this needs to be based on AvailDbIds instead of off of strings :D
    for (const time of Object.keys(assignmentText)) {
      // if it's mine make it a thing and if its another's make it diff
      if (assignmentText[time] == ) {
        colors[time] = `hsl(${Math.round((360 / 10) * 1)}, 100%, 80%)`;
      } else if (assignmentText[time] == selectedSwapPartner) {
        colors[time] = `hsl(${Math.round((360 / 10) * 2)}, 100%, 80%)`;
      }

      // if (text[time] in nameToColor) {
      //   colors[time] = nameToColor[text[time]];
      // } else {
      //   nameToColor[text[time]] = backgroundColors[numColors % backgroundColors.length];
      //   colors[time] = backgroundColors[numColors % backgroundColors.length];
      //   numColors++;
      // }
    }
    return colors;
      //*/
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { value } = event.target;
    setEmail(value);
  };

  // const respondentNames = Array.from(
  //   new Set(
  //     (data.shiftAssignments as { userName: string; availabilityDbId: number }[]).map((shift) => ({
  //       userName: shift.userName,
  //       id: shift.availabilityDbId,
  //     })),
  //   ),
  // );

  const respondentNames: { name: string; id: number }[] = data.shiftAssignments.reduce(
    (nameSet: { name: string; id: number }[], assignment: any) => {
      if (
        nameSet.every((existingName) => existingName.id !== assignment.availabilityDbId) &&
        assignment.availabilityDbId != userId
      ) {
        nameSet.push({ name: assignment.userName, id: assignment.availabilityDbId });
      }
      return nameSet;
    },
    [],
  );
  return (
    <div className="availabilityRoot">
      <>
        <div className="scheduleName">
          Schedule for <b>{data.name}</b>
        </div>
        {userId !== null ? (
          <>
            <div>
              <em>Please select the shifts that you would like to swap.</em>
            </div>
            <br />

            <form
              onSubmit={(event: React.SubmitEvent<HTMLFormElement>) => {
                event.preventDefault();
                addToasts(
                  CreateSwapRequestMutation.mutateAsync({
                    shiftStartTimes: selectedCells,
                    requesterId: userId,
                    recipientId: selectedSwapPartnerAvailabilityId,
                  }),
                  undefined,
                  "Request created! Please check your email to authenticate this request.",
                ); //remove success message
              }}
            >
              <Calendar
                Cell={FillableCell}
                selectedCells={selectedCells}
                setSelectedCells={(cells) => {
                  const next = typeof cells === "function" ? cells(selectedCells) : cells;
                  setSelectedCells(next);
                }}
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
                colors={/*selectionColors*/ assignmentColors}
                text={assignmentText}
                setFocusedCell={setFocusedTime}
              />
              <div>
                <div className="swapPartnerLabel">
                  <label>Swapping with:</label>
                  {/* <label>
                    {data.shiftAssignments.map((availabilityDbId: number, username: string) =>
                      renderPartnerSelect(username, availabilityDbId),
                    )}
                  </label> */}
                  <div className="respondentList">
                    <ul>
                      {respondentNames.map((shift) => (
                        <li
                          key={shift.id}
                          className={selectedSwapPartnerAvailabilityId === shift.id ? "selectedRespondent" : ""}
                          onClick={() => {
                            setSelectedSwapPartnerAvailabilityId((prev) => {
                              console.log(`selected name: ${shift.name}, selected id: ${shift.id}`);
                              return prev === shift.id ? null : shift.id;
                            });
                            setSelectedSwapPartner((prev) => {
                              return prev === shift.name ? null : shift.name;
                            });
                          }}
                        >
                          {shift.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <button type="submit" className="scheduleBtn swapBtn">
                  Submit
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
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
            <form
              onSubmit={(event: React.SubmitEvent<HTMLFormElement>) => {
                event.preventDefault();
                addToasts(confirmEmailmutation.mutateAsync(email));
              }}
            >
              <label htmlFor="email">Please input the email address you used to input your availability.</label>
              <div>
                <input
                  className="input"
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleInputChange}
                  placeholder="name@example.com..."
                  required
                />
                <button type="submit" className="scheduleBtn swapBtn" disabled={confirmEmailmutation.isPending}>
                  Submit
                </button>
              </div>
            </form>
          </>
        )}
      </>
    </div>
  );
};

export default RequestSwap;
