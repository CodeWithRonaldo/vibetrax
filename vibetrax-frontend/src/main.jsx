import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "./router.jsx";
import { IotaClientProvider, WalletProvider } from "@iota/dapp-kit";
import { networkConfig } from "./config/networkConfig.js";
import "@iota/dapp-kit/dist/index.css";

const queryClient = new QueryClient();
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <IotaClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <RouterProvider router={router} />
        </WalletProvider>
      </IotaClientProvider>
    </QueryClientProvider>
  </StrictMode>
);
