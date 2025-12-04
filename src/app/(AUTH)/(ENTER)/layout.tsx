import { redirect } from "next/navigation";
import { getUser } from "../authhelper";

export const metadata = {
    title: "Log In - Monkey Sense",
    description: "Log in to your Monkey Sense account",
};

export default async function LoginLayout({ children }: Readonly<{children: React.ReactNode}>) {
    const user = await getUser();
    if (user)
        redirect("/");

    return (
        <div>
            {children}
        </div>
    );

}