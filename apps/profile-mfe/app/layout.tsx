import type { Metadata } from "next";
import { QueryProvider } from "../providers/query-provider";

export const metadata: Metadata = { title: "Profile MFE" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <QueryProvider>{children}</QueryProvider>
            </body>
        </html>
    );
}
