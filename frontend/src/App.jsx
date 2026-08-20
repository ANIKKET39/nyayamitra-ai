import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Chat from "./pages/Chat";
import RTIGenerator from "./pages/RTIGenerator";
import SchemeChecker from "./pages/SchemeChecker";
import ComplaintGenerator from "./pages/ComplaintGenerator";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/rti" element={<RTIGenerator />} />
            <Route path="/schemes" element={<SchemeChecker />} />
            <Route path="/complaints" element={<ComplaintGenerator />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
