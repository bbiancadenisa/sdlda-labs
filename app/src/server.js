// SDLDA semester project - baseline service
// Every replica answers with its own hostname, so you can see the load balancer at work.
import express from 'express';
import os from 'node:os';

const app = express();
const port = Number(process.env.PORT ?? 3000);
const hostname = os.hostname();

app.use(express.json());

// Log one line per request; `docker compose logs -f app` shows which replica served it.
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.json({
    message: 'Hello from SDLDA!',
    servedBy: hostname,
    time: new Date().toISOString(),
  });
});

// Simulates a CPU-heavy request (e.g. rendering a feed): blocks the event loop for `ms` milliseconds.
// One Node.js process runs JavaScript on ONE core, so one replica serves at most ~1000/ms requests/s.
app.get('/work', (req, res) => {
  const ms = Math.min(Math.max(Number(req.query.ms) || 20, 1), 1000);
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // busy wait = pure CPU work
  }
  res.json({ servedBy: hostname, workMs: ms });
});

// Used by the Docker healthcheck and by the load balancer.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', servedBy: hostname });
});

const server = app.listen(port, () => {
  console.log(`SDLDA app listening on port ${port} (host ${hostname})`);
});

// Shut down cleanly when Docker stops the container.
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    console.log(`${signal} received, closing server`);
    server.close(() => process.exit(0));
  });
}
