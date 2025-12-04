import "./printstyles.css";

export const metadata = {
    title: "Printable Test - Monkey Sense",
    description: "Customizable randomly generated tests for printing"
};

export default function PrintLayout({ children }: Readonly<{children: React.ReactNode}>) {
    return (
        <div>
            {children}
        </div>
    );

}