import Topbar from "@/components/Topbar";
import DuelResetter from "./DuelResetter";
import { getSecureToken, getUser } from "../(AUTH)/authhelper";

export const metadata = {
    title: "Duel - Monkey Sense",
    description: "Compete with other players in real-time",
};

export default async function DuelPage() {
	await getUser();
	const secureToken = await getSecureToken();

	return <>
		<Topbar />
		<br/>
		<DuelResetter token={secureToken} />
	</>
}