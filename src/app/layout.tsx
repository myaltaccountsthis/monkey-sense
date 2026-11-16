import type { Metadata } from "next";
import { cookies } from "next/headers";
import UIModeProvider from "@/components/UIModeProvider";
import "./globals.css";
import "./old-ui.css";

export const metadata: Metadata = {
    title: "Monkey Sense",
    description: "Number Sense practice website",
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
    const uiMode = cookies().get("ui-mode")?.value === "old" ? "old" : "modern";

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
            </head>
            <body className="text-center m-0" data-ui-mode={uiMode}>
                <UIModeProvider initialMode={uiMode}>
                    {children}
                </UIModeProvider>
            </body>
        </html>
    );
}
