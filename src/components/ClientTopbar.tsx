"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { User } from "../../backend/src/util/types";
import { useUIMode } from "./UIModeProvider";

const links = [
    { href: "/", label: "Home" },
    { href: "/print", label: "Print" },
    { href: "/duel", label: "Duel" },
];

export default function ClientTopbar({ user }: { user: User | false }) {
    const { mode, toggleMode } = useUIMode();
    const isModern = mode === "modern";
    const pathname = usePathname();
    const params = useSearchParams();
    const redirectParam = params.get("redirect");
    const redirectStr = `?redirect=${encodeURIComponent(redirectParam ?? pathname)}`;

    return (
        <div className="topbar sticky z-20 m-0 px-4 sm:px-6 py-2 box-border top-0 bg-[#282828] border-0 border-b border-solid border-zinc-700 w-full flex flex-row flex-wrap gap-3 justify-between items-center">
            <div className="flex-1 text-left">
                <Link href="/" className="text-white text-2xl font-bold no-underline whitespace-nowrap">Monkey Sense</Link>
            </div>
            <nav aria-label="Main navigation" className="order-last w-full sm:order-none sm:w-auto flex flex-row justify-center gap-1">
                { links.map(({ href, label }) =>
                    <Link key={label} href={href} prefetch={href === "/print" ? false : undefined} aria-current={pathname === href ? "page" : undefined} className={`rounded-md px-4 py-2 text-base no-underline transition-colors ${pathname === href ? "bg-[#111] text-white" : "text-zinc-300 hover:bg-[#111] hover:text-white"}`}>{label}</Link>
                ) }
            </nav>
            <div className="sm:flex-1 min-w-0 ml-auto flex flex-row flex-wrap gap-3 justify-end items-center text-sm">
                { user ? <Link className="text-zinc-300 truncate" href={"/users/" + user.user_id}>{ user.username }</Link> : <Link className="text-zinc-300 whitespace-nowrap" href={"/signup" + redirectStr}>Sign Up</Link> }
                <button
                    type="button"
                    role="switch"
                    aria-checked={isModern}
                    onClick={toggleMode}
                    className="inline-flex shrink-0 items-center gap-2 bg-transparent border border-solid border-zinc-500 rounded-md px-2 py-1 text-sm text-white cursor-pointer hover:bg-zinc-700"
                    title={`Switch to ${isModern ? "old" : "modern"} UI`}
                >
                    Modern UI
                    <span aria-hidden="true" className={`inline-flex items-center w-7 h-4 rounded-full ${isModern ? "bg-gray-200 justify-end" : "bg-zinc-600 justify-start"}`}>
                        <span className={`w-3 h-3 mx-0.5 rounded-full ${isModern ? "bg-zinc-800" : "bg-white"}`} />
                    </span>
                </button>
                { user ? <a className="text-zinc-300" href="/logout">Logout</a> : <Link className="text-zinc-300" href={"/login" + redirectStr}>Login</Link> }
            </div>
        </div>
    )
}