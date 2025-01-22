"use server";

export async function getHost() {
	return process.env.SERVER_HOST!;
}