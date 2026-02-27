import { toast } from "react-hot-toast";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addToasts(promise: Promise<any>) {
  toast.promise(promise, {
    loading: "Loading...",
    success: <b>Success!</b>,
    error: (err) => <b>Error: {err.message}</b>,
  });
}

export { addToasts };
