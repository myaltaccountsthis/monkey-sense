import Topbar from "@/components/Topbar";
import DuelResetter from "./DuelResetter";
import { getSecureToken, useUser } from "../(AUTH)/authhelper";

export default async function DuelPage() {
	await useUser();
	const secureToken = await getSecureToken();

	return <>
		<Topbar />
		<br/>
		<DuelResetter token={secureToken} />
	</>
}