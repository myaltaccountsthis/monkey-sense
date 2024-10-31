import "./printstyles.css";

export default function PrintLayout({ children }: Readonly<{children: React.ReactNode}>) {
    return (
        <div>
            {children}
        </div>
    );

}