import { redirect } from "next/navigation";
import { useUser } from "../authhelper";

export default async function LoginLayout({ children }: Readonly<{children: React.ReactNode}>) {
    const user = await useUser();
    if (user)
        redirect("/");

    return (
        <div>
            {children}
        </div>
    );

}