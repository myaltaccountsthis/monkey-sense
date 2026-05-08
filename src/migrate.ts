// UNUSED right now


import path from "path";
import { pool } from "./util/database";
import { readFileSync } from "node:fs";
import { PoolClient } from "pg";

const schemaFile = "db.sql";

const migrators: ((client: PoolClient) => Promise<void>)[] = [
    async (client: PoolClient) => {   // 1
        const lines = readFileSync(path.join(__dirname, schemaFile), "utf-8").split("\n");
        for (let line of lines) {
            line = line.trim();
            if (line !== "" && !line.startsWith("--")) {
                await client.query(line);
            }
        }
    }
]

export async function register() {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM config");
    let version = 0;
    
    if (result.rows.length > 1) {
        console.error("Multiple config rows found, this should not happen");
    }
    if (result.rows.length === 1) {
        version = result.rows[0].version;
    }
    
    // Migrate to latest version
    while (version < migrators.length) {
        try {
            await migrators[version](client);
            version++;
            await client.query("INSERT INTO config (version) VALUES ($1) ON CONFLICT (id) DO UPDATE SET version = $1", [version]);
        }
        catch (error) {
            console.error(`Error occurred while running migration ${version}:`, error);
            throw error;
        }
    }
}