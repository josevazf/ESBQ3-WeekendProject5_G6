"use client";
import { WagmiConfig, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import Navbar from "@/components/instructionsComponent/navigation/navbar";


const chains = [sepolia];

const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    alchemyId: process.env.ALCHEMY_API_KEY, // or infuraId
    walletConnectProjectId: "G6 Lottery",

    // Required
    appName: "Group 6 Lottery",
		chains,
    // Optional
    appDescription: "Lottery",
    appUrl: "https://esbq3-group6-lottery.netlify.app/", // your app's url
    appIcon: "https://family.co/logo.png", // your app's logo,no bigger than 1024x1024px (max. 1MB)
  })
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <WagmiConfig config={config}>
        <ConnectKitProvider theme="retro">
          <body>
            <div style={{ display: "flex", flexDirection: "column"}}>
              <Navbar />
              <div style={{flexGrow: 1}}>{children}</div>
            </div>
          </body>
        </ConnectKitProvider>
      </WagmiConfig>
    </html>
  );
}
