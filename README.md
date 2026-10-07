# SDLDA Labs

Lab skeleton for **System Design for Large-Scale and Distributed Applications** (UPT, Master DMWD).
The whole stack runs in containers: on your machine you only need Docker (with Compose v2), Git, an editor and a terminal.

## Quick start

```
docker compose up -d
docker compose ps
```

Open http://localhost:8080 and refresh a few times.

## Profiles

| Profile  | Services                 | Used in labs |
|----------|--------------------------|--------------|
| *(core)* | app, nginx               | all          |
| `cache`  | redis                    | 3-4          |
| `sql`    | postgres, adminer        | 7            |
| `nosql`  | mongo                    | 7            |
| `queue`  | rabbitmq                 | 8            |
| `stream` | kafka                    | 9            |
| `lambda` | lambda (local emulator)  | 11-12        |
| `all`    | everything above         |              |
| `tools`  | k6, npm (run on demand)  |              |

```
docker compose --profile cache up -d
docker compose --profile all up -d
```

## Useful commands

| What | Command |
|------|---------|
| Scale the app to 3 replicas | `docker compose up -d --scale app=3` |
| Follow app logs | `docker compose logs -f app` |
| Live reload while coding | `docker compose watch` |
| Add an npm package | `docker compose run --rm npm install <package>` |
| Load test | `docker compose run --rm k6 run /scripts/smoke.js` |
| Scaling test (1 vs 3 replicas) | `docker compose run --rm k6 run /scripts/scaling.js` |
| Redis CLI | `docker compose exec redis redis-cli` |
| PostgreSQL shell | `docker compose exec postgres psql -U sdlda` |
| Adminer (DB web UI) | http://localhost:8081 (server `postgres`, user/password `sdlda`) |
| MongoDB shell | `docker compose exec mongo mongosh` |
| RabbitMQ UI | http://localhost:15672 (user/password `sdlda`) |
| Kafka topics | `docker compose exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list` |
| Invoke the Lambda | `curl -d "@lambda/event.json" http://localhost:9000/2015-03-31/functions/function/invocations` |
| Stop everything | `docker compose --profile all down` |
| Stop and delete data | `docker compose --profile all down -v` |

On Windows PowerShell, type `curl.exe` instead of `curl`.

## Ports

Change any host port by copying `.env.example` to `.env` and editing it.

## Scaling experiment (Lab 1)

`smoke.js` checks that the stack works; it will look the same with 1 or 3 replicas, because
10 users sleeping 0.1 s generate only ~100 cheap requests/s, far below what one replica can serve.

`scaling.js` offers a fixed 100 requests/s to `/work`, which costs 20 ms of CPU per request.
One Node.js process uses one core, so one replica tops out at ~50 requests/s.

```
docker compose up -d --build --scale app=1
docker compose run --rm k6 run /scripts/scaling.js
docker compose up -d --scale app=3
docker compose run --rm k6 run /scripts/scaling.js
```

Compare `http_reqs` (requests/s), `http_req_duration` p(95), `dropped_iterations` and the thresholds.
Watch `docker stats` in a second terminal while the test runs.
