import Game from "@/components/game";
import Topbar from "@/components/Topbar";
import { useUser } from "./(AUTH)/authhelper";

export default async function Home() {
    const user = await useUser();
    return (
        <div>
            <Topbar />
            <br/>
            <Game isSignedIn={Boolean(user)} />
        </div>
    );
}
