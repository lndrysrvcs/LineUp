import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "./App.css";
import Topbar from "./components/Topbar";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Topbar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Topbar>
    </BrowserRouter>
  );
}

export default App;
