import Topbar from "@/components/Topbar";
import DuelResetter from "./DuelResetter";
import { useUser } from "../(AUTH)/authhelper";

export default async function DuelPage() {
	const user = await useUser();
	return <>
		<Topbar />
		<br/>
		<DuelResetter isSignedIn={user !== false} />
	</>
}