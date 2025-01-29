import Topbar from "@/components/Topbar";
import { getUserData } from "../../../../backend/src/util/database";

export default async function User({ params }: { params: { user: string } }) {
    const user_id = parseInt(params.user);
    const user = await getUserData(user_id);
    
    if (!user)
        return <div>Invalid user</div>
    
    return (
        <div>
            <Topbar />
            <br/>
            <div>
                <div className="text-3xl font-bold">{user.username}</div>
                <br/>
                <div className="text-2xl mb-3">Stats</div>
                <div className="grid gap-y-2">
                    <div>Accuracy: {Math.round(user.questions_correct / Math.max(1, user.questions_answered) * 100)}%</div>
                    <div>Questions: {user.questions_correct}/{user.questions_answered}</div>
                    <div>Tests Taken: {user.tests_taken}</div>
                    <div>Duel Wins: {user.wins}</div>
                </div>
            </div>
        </div>
    )
}