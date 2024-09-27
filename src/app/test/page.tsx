import "@/app/globals.css"
import TestClient from "@/components/TestClient";
import { handleSubmit } from "./submit/route";

const onSubmit = async (formData: FormData) => {
    "use server"
    return await handleSubmit(formData);
};

export default async function Test() {
    return (
        <TestClient onSubmit={onSubmit} />
    )
}