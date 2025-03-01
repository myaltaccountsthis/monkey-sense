export default function WrongIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="24" height="24" viewBox="0 0 10 10" fill="none" stroke="#E00" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 1 1 L 9 9 M 9 1 L 1 9"  />
        </svg>
    );
}