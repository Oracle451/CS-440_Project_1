import eventBus from "./eventBus.js";

const clients = new Set();

function broadcast(eventName, data) {
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    client.write(payload);
  }
}

const WATCHED_EVENTS = [
  "post:created",
  "post:updated",
  "post:deleted",
  "post:liked",
  "post:disliked",
];

WATCHED_EVENTS.forEach((event) => {
  eventBus.on(event, (data) => broadcast(event, data));
});

export function addSseClient(res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const heartbeat = setInterval(() => res.write(": heartbeat\n\n"), 25_000);

  clients.add(res);
  console.log(`[SSE] client connected  (total: ${clients.size})`);

  res.on("close", () => {
    clearInterval(heartbeat);
    clients.delete(res);
    console.log(`[SSE] client disconnected (total: ${clients.size})`);
  });
}
