import Topbar from "@/components/Topbar";
import DuelResetter from "./DuelResetter";
import { getSecureToken, getUser } from "../(AUTH)/authhelper";

export default async function DuelPage() {
	await getUser();
	const secureToken = await getSecureToken();

	return <>
		<Topbar />
		<br/>
		<DuelResetter token={secureToken} />
	</>
}