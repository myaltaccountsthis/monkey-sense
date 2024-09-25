import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Monkey Sense",
    description: "Number Sense practice website",
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
            </head>
            <body className="text-center">
                {children}
            </body>
        </html>
    );
}
