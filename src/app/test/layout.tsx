import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test - Monkey Sense",
  description: "Randomly generated number sense tests",
};

export default function TestLayout({ children }: Readonly<{children: React.ReactNode}>) {
    return (
        <>
            {children}
        </>
    );
}
