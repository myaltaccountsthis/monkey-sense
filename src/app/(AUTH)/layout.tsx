import Topbar from "@/components/Topbar";

export default function AuthLayout({ children }: Readonly<{children: React.ReactNode}>) {
    return (
        <>
            <Topbar />
            {children}
        </>
    );
}