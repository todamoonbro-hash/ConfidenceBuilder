import "./globals.css";

import { AppShell } from "../components/ui/app-shell";

export interface RootLayoutProps {
  children: unknown;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
