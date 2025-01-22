import { ViewableLeadeboardEntry } from "@/../backend/src/util/types";

interface LeaderboardEntryComponentProps {
    entry: ViewableLeadeboardEntry;
    i: number;
};

export default function LeaderboardEntryComponent({entry, i}: LeaderboardEntryComponentProps) {
    return <tr key={i}><td>{entry.username}</td><td>{entry.correct}</td><td>{entry.answered}</td><td>{entry.test_length}</td><td>{entry.adjusted}</td><td>{entry.time.toFixed(1)}</td></tr>
}