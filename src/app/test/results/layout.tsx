import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Results - Monkey Sense",
  description: "View your test results",
};

export default function TestResultsLayout({ children }: Readonly<{children: React.ReactNode}>) {
    return (
        <>
            {children}
        </>
    );
}
