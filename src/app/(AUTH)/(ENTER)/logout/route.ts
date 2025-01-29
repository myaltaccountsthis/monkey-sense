import { NextRequest } from "next/server";
import { onLogOut } from "../../authhelper";

export async function GET(request: NextRequest) {
    await onLogOut(request.headers.get("referer") ?? "/");
}