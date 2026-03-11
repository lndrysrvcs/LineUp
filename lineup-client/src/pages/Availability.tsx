import { Calendar } from "@/components/Calendar";
import { FillableCell } from "@/components/CalendarCells";
import { queryClient, useApi } from "@/utils/api";
import { addToasts, loaderQuery } from "@/utils/db";
import { parseTimeString } from "@/utils/time";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";

const Availability = () => {
  const navigate = useNavigate();
  const { fetchWithAuth } = useApi();
  const { guid } = useParams();
  const { data } = useQuery(loaderQuery("/api/schedule/{}", guid!));

  console.log(data);

  type CreateAvailabilityProps = {
    userName: string;
    userEmail: string;
    availabilitySlots: string[]; // full of ISO strings
  };

  const createAvailabilityMutation = useMutation({
    mutationFn: async (newAvailability: CreateAvailabilityProps) => {
      console.log(newAvailability);
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
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      navigate("/");
    },
  });

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (formData.get("calendarSelected") === "") {
      alert("Please select at least one time slot.");
      return;
    }

    addToasts(
      createAvailabilityMutation.mutateAsync({
        userName: formData.get("name") as string,
        userEmail: formData.get("email") as string,
        availabilitySlots: (formData.get("calendarSelected") as string).split(","),
      }),
    );
  };

  return (
    <div className="availabilityRoot">
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
            <input className="input" type="text" id="name" name="name" required />
          </div>
          <div>
            <label htmlFor="email" className="required">
              Email
            </label>
            <br />
            <input className="input" type="email" id="email" name="email" required />
          </div>
        </div>
        <div>
          <label className="availabilityLabel required">Availability</label>
          <Calendar
            Cell={FillableCell}
            minutesPerCell={data.schedulePreferences?.minutesPerSlot || 15}
            dates={data.dateCoverage?.map((d: string) => new Date(d)) ?? []}
            range={{
              start: parseTimeString(data.startTime)!,
              end: parseTimeString(data.endTime)!,
            }}
          ></Calendar>
        </div>
        <div className="submitContainer">
          <button type="submit" className="submitBtn" disabled={createAvailabilityMutation.isPending}>
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Availability;
