import { createServer } from "http";
import { WebSocketServer } from "ws";
import { Game, parseWebSocketMessage } from "./game";
import { decrypt } from "./util/encrypt";
import { getGuestUser, isValidToken } from "./util/auth";
import { User } from "./util/types";

const server = createServer((req, res) => {
	res.writeHead(200, { "Content-Type": "application/json" });
	res.end(JSON.stringify({ type: "status", data: "OK" }));
});
const wss = new WebSocketServer({ server });

const singletonGame = new Game();

const getAvailableGame = () => singletonGame.isFull() ? null : singletonGame;

wss.on("connection", async (ws) => {
	const sendError = (message: string) => {
		ws.send(JSON.stringify([{ type: "error", data: message }]));
		ws.close();
	};

	// Check auth
	let useGuest = false;
	const user = await new Promise<User>((res, rej) => {
		ws.once("message", async (message) => {
			try {
				const data = parseWebSocketMessage(message);
				if (data.type !== "auth")
					throw "Type is not auth";
				if (data.data === "") {
					useGuest = true;
					res(getGuestUser());
					return;
				}
				const secureToken = data.data;
				if (typeof secureToken !== "string")
					throw "Token is not a string";
				const token = decrypt(secureToken);
				const user = await isValidToken(token);
				if (!user)
					throw "No user found with token " + token.substring(0, 20) + "...";
				res(user);
			}
			catch (e) {
				console.log("Invalid auth message", e);
				rej(e);
			}
		});
	}).catch(() => null);

	// Make sure user is authenticated or guest
	if (!user)
		return sendError("Invalid auth message");
	
	// Check for available game (singleton rn)
	const game = getAvailableGame();
	if (!game)
		return sendError("Server full");

	if (game.isPlayerConnected(user.user_id)) {
		// If user is signed in, do not allow them to connect twice
		if (user.user_id > 0)
			return sendError("Already connected");
		// If user is guest, regenerate user_id until it is unique
		do {
			user.user_id = getGuestUser().user_id;
		}
		while (game.isPlayerConnected(user.user_id));
	}
	
	// Connect to available game
	const id = game.connect(ws, user);

	ws.on("error", console.error);
	ws.on("message", game.bindOnMessage(id));
	ws.on("close", () => game.disconnect(id));

	console.log("Currently connected:", wss.clients.size);
});

server.listen(process.env.NODE_ENV === "production" ? 8080 : 8081);
singletonGame.start();

console.log("Listening on port", server.address());

export default 1;