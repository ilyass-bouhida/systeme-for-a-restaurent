import App from "@/App";
import { queryClient } from "@/app/query-client";
import "@/styles/global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{ className: "font-sans" }}
          richColors
        />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
