import { SessionProvider } from "next-auth/react";
import MaintenanceGate from "../components/MaintenanceGate";
import "../styles/globals.css";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <MaintenanceGate>
        <Component {...pageProps} />
      </MaintenanceGate>
    </SessionProvider>
  );
}
