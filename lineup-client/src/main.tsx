import App from "@/App.tsx";
import "@/index.css";
import { AuthProvider, queryClient } from "@/utils/api";
import { Auth0Provider } from "@auth0/auth0-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: globalThis.location.origin,
          audience: "https://lineup-api/",
        }}
        cacheLocation="localstorage"
        useRefreshTokens={true}
      >
        <AuthProvider>
          <Toaster containerStyle={{ fontSize: "0.65rem" }} />
          <App />
        </AuthProvider>
      </Auth0Provider>
    </QueryClientProvider>
  </StrictMode>,
);
