import { LeaderboardEntry } from "@/util/types";

interface LeaderboardEntryComponentProps {
    entry: LeaderboardEntry;
    i: number;
};

export default function LeaderboardEntryComponent({entry, i}: LeaderboardEntryComponentProps) {
    return <tr key={i}><td>{entry.name}</td><td>{entry.correct}</td><td>{entry.answered}</td><td>{entry.test_length}</td><td>{entry.adjusted}</td><td>{entry.time.toFixed(1)}</td></tr>
}