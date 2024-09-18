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
                <script src="https://cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/seedrandom.min.js"></script>
                <script src="generator.js"></script>
                <script src="main.js"></script>
                <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
            </head>
            <body className="text-center">
                {children}
            </body>
        </html>
    );
}
