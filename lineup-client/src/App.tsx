import "@/App.css";
import Topbar from "@/components/Topbar";
import Home from "@/pages/Home";
import NewSchedule from "@/pages/NewSchedule";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";

function App() {
  return (
    <BrowserRouter>
      <Topbar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/newschedule" element={<NewSchedule />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Topbar>
    </BrowserRouter>
  );
}

export default App;
