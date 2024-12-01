import DuelResetter from "./DuelResetter";

async function getHost() {
	"use server";
	return process.env.SERVER_HOST!;
}

export default function DuelPage() {
	return <DuelResetter getHost={getHost} />
}