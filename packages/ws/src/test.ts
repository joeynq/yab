import { decode, encode } from "@msgpack/msgpack";

const socket = new WebSocket("ws://localhost:3000/ws");

const testChannel = {
	channel: "/test",
	event: "some-message",
	data: { event: "Hello!" },
};

socket.onopen = (event) => {
	console.log("Connected");
};

socket.onmessage = (event) => {
	const data = decode(event.data) as any;

	if (data.type === "opened") {
		socket.send(encode({ ...testChannel, sid: data.sid }));
		// socket.send(JSON.stringify({ ...testChannel, sid: data.sid }));
	}
};

socket.onclose = (e) => {};
