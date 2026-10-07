// k6 scaling test: a FIXED arrival rate of requests to a CPU-heavy endpoint.
//
// Compare 1 replica vs 3 replicas:
//   docker compose up -d --build --scale app=1
//   docker compose run --rm k6 run /scripts/scaling.js
//   docker compose up -d --scale app=3
//   docker compose run --rm k6 run /scripts/scaling.js
//
// Tunables (optional):  -e RATE=100  -e WORK_MS=20
//   docker compose run --rm -e RATE=150 k6 run /scripts/scaling.js
//
// Each request costs WORK_MS ms of CPU, so one replica can serve at most
// 1000 / WORK_MS requests/s (50 req/s for 20 ms). RATE=100 is 2x that.
import http from 'k6/http';
import { check } from 'k6';
import exec from 'k6/execution';

const BASE_URL = __ENV.BASE_URL || 'http://nginx';
const RATE = Number(__ENV.RATE || 100);       // requests per second offered
const WORK_MS = Number(__ENV.WORK_MS || 20);  // CPU time per request

export const options = {
  scenarios: {
    fixed_rate: {
      // Open model: new requests arrive at RATE/s whether or not the
      // previous ones have finished, like real users would.
      executor: 'constant-arrival-rate',
      rate: RATE,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 50,
      maxVUs: 300,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<100'],   // 95% of requests under 100 ms
  },
};

// Runs once before the test: fail fast if /work is missing (old app image).
export function setup() {
  const res = http.get(`${BASE_URL}/work?ms=1`);
  if (res.status !== 200) {
    exec.test.abort(`GET /work returned ${res.status}. Rebuild the app image: docker compose up -d --build`);
  }
}

export default function () {
  const res = http.get(`${BASE_URL}/work?ms=${WORK_MS}`);
  check(res, { 'status is 200': (r) => r.status === 200 });
}
