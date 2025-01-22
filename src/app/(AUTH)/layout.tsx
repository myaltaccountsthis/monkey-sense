import Topbar from "@/components/Topbar";

export default function SignUpLayout({ children }: Readonly<{children: React.ReactNode}>) {
    return (
        <>
            <Topbar />
            {children}
        </>
    );
}