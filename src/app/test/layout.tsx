import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "[Test] Monkey Sense",
  description: "Number Sense practice website",
};

export default function TestLayout({ children }: Readonly<{children: React.ReactNode}>) {
    return (
        <>
            {children}
        </>
    );
}
