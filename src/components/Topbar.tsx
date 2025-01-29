import { getUser } from "@/app/(AUTH)/authhelper";
import ClientTopbar from "./ClientTopbar";

export default async function Topbar() {
    const user = await getUser();

    return (
        <>
            <ClientTopbar user={user} />
        </>
    )
}