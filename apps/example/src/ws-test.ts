const ws = new WebSocket("ws://localhost:3000/ws");

let sid = "";

ws.onmessage = (event) => {
	const data = JSON.parse(new TextDecoder().decode(event.data));

	if (data.sid) {
		console.log("Received sid", data);
	}

	if (data.sid && data.type === "connect") {
		console.log("Connected");
		sid = data.sid;

		ws.send(
			new TextEncoder().encode(
				JSON.stringify({
					sid,
					type: "subscribe",
					channel: "/",
					data: "/test",
				}),
			),
		);
	}
};

setInterval(() => {
	if (!sid) {
		return;
	}
	console.log("Sending message");
	ws.send(
		new TextEncoder().encode(
			JSON.stringify({
				sid,
				type: "some-message",
				channel: "/test",
				data: {
					foo: "bar",
					bar: 123,
				},
			}),
		),
	);
}, 2000);
