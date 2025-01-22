import { onLogOut } from "../authhelper";

export async function GET() {
    await onLogOut();
}