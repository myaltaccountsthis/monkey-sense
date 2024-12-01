import { createServer } from "http";
import { WebSocketServer } from "ws";
import { Game } from "./game";

const server = createServer((req, res) => {
	res.writeHead(200, { "Content-Type": "application/json" });
	res.end(JSON.stringify({ type: "status", data: "OK" }));
});
const wss = new WebSocketServer({ server });

const game = new Game();

wss.on("connection", (ws) => {
	const id = game.connect(ws);
	if (!id) {
		ws.send(JSON.stringify({ type: "error", data: "Server full" }));
		ws.close();
		console.log("Server full");
		return;
	}

	ws.on("error", console.error);
	ws.on("message", game.bindOnMessage(id));
	ws.on("close", () => game.disconnect(id));

	console.log("Currently connected:", wss.clients.size);
});

server.listen(process.env.NODE_ENV === "production" ? 8080 : 8081);
game.start();

console.log("Listening on port", server.address());

export default 1;