import { Calendar } from "@/components/Calendar";
import { ColoredCell, FillableCell } from "@/components/CalendarCells";
import { MousePopup } from "@/components/MousePopup";
import { queryClient, useApi } from "@/utils/api";
import { addToasts, loaderQuery } from "@/utils/db";
import { parseTimeString } from "@/utils/time";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

const RequestSwap = () => {
  const navigate = useNavigate();
  const { fetchWithAuth } = useApi();
  const { guid } = useParams();
  const { data } = useQuery(loaderQuery("/api/schedule/{}/requestSwap", guid!));
  const [focusedTime, setFocusedTime] = useState<string | null>(null);
  //   const storageKey = `availability-${guid}`;
  const backgroundColors = Array.from({ length: 10 }, (_, i) => `hsl(${Math.round((360 / 10) * i)}, 100%, 80%)`);
  console.log(backgroundColors);

  console.log(data);

  type SwapRequestProps = {
    //define what will be sent to the backend function ScheduleController.cs/RequestSwap()
    shifts: string[]; //List<ShiftAssignment>;
    // userName: string;
    // userEmail: string;
    // availabilitySlots: string[]; // full of ISO strings
  };

  const updateAvailabilityMutation = useMutation({
    mutationFn: async (updatedAvailability: SwapRequestProps) => {
      const res = await fetchWithAuth(`/api/schedule/${guid}/requestSwap`, {
        method: "POST",
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
    // onSuccess: () => {
    //   try {
    //     localStorage.removeItem(storageKey);
    //   } catch {
    //     // ignore storage errors
    //   }
    //   queryClient.invalidateQueries({ queryKey: ["availability"] });
    //   navigate("/");
    // },
  });
  return <div>hello :wave:</div>;
};

export default RequestSwap;
