import type { LinksFunction, V2_MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { useEffect } from "react";
import { EquipmentProvider } from "~/equipmentContext";
import stylesheet from "~/tailwind.css";

export const meta: V2_MetaFunction = () => [{ title: "New Remix App" }];

export const links: LinksFunction = () => [{ rel: "stylesheet", href: stylesheet }];

export default function App() {
  useEffect(() => {
    window.electronAPI.onUpdateAvailable(() => {
      alert("A new update is available. Downloading now...");
    });

    window.electronAPI.onUpdateDownloaded(() => {
      alert("Update downloaded. It will be installed on restart. Please restart the application.");
    });
  }, []);

  return (
    <EquipmentProvider>
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body>
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          {process.env.NODE_ENV === "development" && <LiveReload />}
        </body>
      </html>
    </EquipmentProvider>
  );
}
