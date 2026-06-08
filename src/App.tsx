import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import StaffLogin from "@/pages/StaffLogin";
import Distribute from "@/pages/Distribute";
import Exchange from "@/pages/Exchange";
import AdminLogin from "@/pages/AdminLogin";
import Dashboard from "@/pages/Dashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/staff/distribute" element={<Distribute />} />
        <Route path="/staff/exchange" element={<Exchange />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
