import { ViewableLeadeboardEntry } from "@/util/types";

interface LeaderboardEntryComponentProps {
    entry: ViewableLeadeboardEntry;
    i: number;
};

export default function LeaderboardEntryComponent({entry, i}: LeaderboardEntryComponentProps) {
    return <tr key={i}><td><a className="text-inherit hover:text-gray-200" href={`/users/${entry.user_id}`}>{entry.username}</a></td><td>{entry.correct}</td><td>{entry.answered}</td><td>{entry.adjusted}</td><td>{entry.time.toFixed(1)}</td></tr>
}