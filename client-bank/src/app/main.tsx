import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import { ThemeProvider } from "../shared/lib/provider/themeProvider";
import { AuthProvider } from "../shared/lib//AuthProvider";
import { AppLayout } from "../shared/ui/layout/appLayout";


if ("serviceWorker" in navigator) {
  console.log("[push][client] Registering service worker /firebase-messaging-sw.js");
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("[push][client] Service worker registered", {
        scope: registration.scope,
        activeState: registration.active?.state,
      });
    })
    .catch((error) => {
      console.error("[push][client] Service worker registration failed", error);
    });
} else {
  console.warn("[push][client] Service workers are not supported in this browser");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppLayout>
            <AppRoutes />
          </AppLayout>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
