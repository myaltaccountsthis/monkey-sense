import { handleSubmit } from "@/util/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const data = await handleSubmit(await request.formData());
    if (!data)
        return NextResponse.json("", {status: 400});
    return NextResponse.json(data);
}