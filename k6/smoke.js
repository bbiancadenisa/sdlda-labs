// k6 smoke test: 10 virtual users for 30 seconds against the load balancer.
// Run with:  docker compose run --rm k6 run /scripts/smoke.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],   // less than 1% errors
    http_req_duration: ['p(95)<200'], // 95% of requests under 200 ms
  },
};

// Inside the compose network the load balancer is reachable as "nginx".
const BASE_URL = __ENV.BASE_URL || 'http://nginx';

export default function () {
  const res = http.get(`${BASE_URL}/`);
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(0.1);
}
