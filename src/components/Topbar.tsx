import { useUser } from "@/app/(AUTH)/authhelper";
import ClientTopbar from "./ClientTopbar";

export default async function Topbar() {
    const user = await useUser();

    return (
        <>
            <ClientTopbar user={user} />
        </>
    )
}