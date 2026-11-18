import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    classic?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

export default function Button({ className, classic = false, onClick, children, ...props }: ButtonProps) {
    const styles = classic
        ? "border-2 border-black border-solid rounded-md px-2 py-1 bg-gray-200 hover:bg-gray-300 hover:scale-[1.03] hover:cursor-pointer hover:shadow-md active:bg-gray-400 transition-all duration-100"
        : "ui-button box-border border border-black border-solid rounded-md px-4 py-2 bg-gray-200 text-black hover:bg-gray-300 hover:cursor-pointer active:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150";

    return (
        <button
            type="button"
            className={twMerge(styles, className)}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    )
}