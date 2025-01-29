"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { User } from "../../backend/src/util/types";

const links = [
    { href: "/", label: "Home" },
    { href: "/print", label: "Print" },
    { href: "/duel", label: "Duel" },
];

export default function ClientTopbar({ user }: { user: User | false }) {
    const pathname = usePathname();
    const params = useSearchParams();
    const redirectParam = params.get("redirect");
    const redirectStr = `?redirect=${encodeURIComponent(redirectParam ?? pathname)}`;

    return (
        <div className="sticky m-0 pl-2 pr-4 box-border top-0 bg-[#282828] w-full h-11 flex flex-row justify-center items-center">
            <div className="flex-grow basis-1 text-left h-full">
                <Link href="/">
                    <button className="h-full px-2 bg-inherit hover:bg-[#111] transition-colors border-none text-white text-2xl font-bold">Monkey Sense</button>
                </Link>
            </div>
            <div className="flex-grow hidden lg:flex lg:flex-row lg:justify-center lg:h-full lg:box-border">
                { links.map(({ href, label }) =>
                    <a key={label} href={href}>
                        <button className="h-full px-3 bg-inherit hover:bg-[#111] transition-colors border-none text-white">{label}</button>
                    </a>
                ) }
            </div>
            <div className="flex-grow basis-1 flex flex-row justify-end">
                { user ? <Link className="text-white" href={"/users/" + user.user_id}>{ user.username }</Link> : <Link className="text-white" href={"/signup" + redirectStr}>Sign Up</Link> }
                <div className="w-4">|</div>
                { user ? <a className="text-white" href="/logout">Logout</a> : <Link className="text-white" href={"/login" + redirectStr}>Login</Link> }
            </div>
        </div>
    )
}