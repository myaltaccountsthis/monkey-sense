"use client"

import { MathJaxConfig } from "@/util/types";
import { MathJax, MathJaxContext } from "better-react-mathjax";

interface TestClientProps {
    strings: string[];
};

export default function TestClient({ strings }: TestClientProps) {
    return (
        <MathJaxContext config={MathJaxConfig}>
            <form action="/test/submit" method="POST" onKeyDown={(e) => {if (e.key === "Enter") e.preventDefault();}}>
                <div className="flex flex-col items-center gap-y-4 flex-wrap px-4">
                    {
                        strings.map((str, i) =>
                            <div key={i} className="text-2xl w-full flex flex-row gap-x-2">
                                <MathJax dynamic className="text-left ml-10 -indent-10 flex-auto" inline tabIndex={-1}>{i + 1}. {str}</MathJax>
                                <input name={`q${i}`} className="text-2xl flex-shrink text-black" type="text" autoComplete="off" />
                            </div>
                        )
                    }
                </div>
                <br/>
                <label htmlFor="name-entry" className="text-2xl">Enter your name: </label>
                <input name="name" id="name-entry" className="text-xl text-black" type="text" maxLength={20} />
                <br/>
                <input className="mx-auto my-4 text-2xl text-black px-2 py-1" type="submit" value="Submit" />
            </form>
        </MathJaxContext>
    );
}