
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RentedDevices from "./pages/RentedDevices";
import LoanedDevices from "./pages/LoanedDevices";
import SoldDevices from "./pages/SoldDevices";
import DevelopmentDevices from "./pages/DevelopmentDevices";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/rented-devices" element={<RentedDevices />} />
          <Route path="/loaned-devices" element={<LoanedDevices />} />
          <Route path="/sold-devices" element={<SoldDevices />} />
          <Route path="/development-devices" element={<DevelopmentDevices />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
