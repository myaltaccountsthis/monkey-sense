import Game from "@/components/game";
import Topbar from "@/components/Topbar";
import { getUser } from "./(AUTH)/authhelper";

export default async function Home() {
    const user = await getUser();
    return (
        <div>
            <Topbar />
            <br/>
            <Game isSignedIn={Boolean(user)} />
        </div>
    );
}
