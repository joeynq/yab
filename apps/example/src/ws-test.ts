const ws = new WebSocket("ws://localhost:3000/ws");

let sid = "";

ws.onmessage = (event) => {
	const data = JSON.parse(new TextDecoder().decode(event.data));
	if (data.sid && data.type === "connect") {
		sid = data.sid;
	}

	console.log(data);
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
				type: "data",
				topic: "/test",
				event: "some-message",
				data: {
					foo: "bar",
					bar: 123,
				},
			}),
		),
	);
}, 1000);
