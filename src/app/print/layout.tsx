import "./printstyles.css";

export const metadata = {
    title: "Printable Test - Monkey Sense",
    description: "Customizable randomly generated tests for printing"
};

export default function PrintLayout({ children }: Readonly<{children: React.ReactNode}>) {
    return (
        <div className="print-page">
            {/* Keep page settings local to this route to avoid named-page breaks. */}
            <style>{"@page { size: letter; margin: .5in; }"}</style>
            {children}
        </div>
    );

}