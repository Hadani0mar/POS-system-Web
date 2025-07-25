
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import POS from "./pages/POS";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Settings from "./pages/Settings";
import ShiftEnd from "./pages/ShiftEnd";
import ShiftReports from "./pages/ShiftReports";
import TopBar from "./components/TopBar";

const App = () => {
  const [showLanding, setShowLanding] = useState(true);
  
  // تحقق مما إذا كان ينبغي عرض صفحة الهبوط من التخزين المحلي
  useEffect(() => {
    // Always show landing page when the app starts
    const now = new Date();
    // Store the current timestamp to localStorage
    localStorage.setItem("landingShown", now.toISOString());
  }, []);

  const handleLandingComplete = () => {
    setShowLanding(false);
  };

  if (showLanding) {
    return (
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Landing onComplete={handleLandingComplete} />
        </TooltipProvider>
      </ThemeProvider>
    );
  }

  return (
    <AppProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex flex-col min-h-screen relative">
              <TopBar />
              <div className="flex-1 overflow-auto p-2 md:p-4">
                <Routes>
                  <Route path="/" element={<POS />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/shift-end" element={<ShiftEnd />} />
                  <Route path="/shift-reports" element={<ShiftReports />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AppProvider>
  );
};

export default App;
