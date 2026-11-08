import http from "k6/http";
import { check } from "k6";

const baseUrl = (__ENV.BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
const endpoints = [
  { name: "cities", path: "/api/v1/cities" },
  // { name: "cinemas", path: "/api/v1/cinemas" },
  // { name: "shows", path: "/api/v1/shows" },
];

export const options = {
  scenarios: {
    api_load: {
      executor: "constant-vus",
      vus: 1000,
      duration: "15s",
      gracefulStop: "5s",
    },
  },
  thresholds: {
    checks: ["rate>0.99"],
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

export default function () {
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const response = http.get(`${baseUrl}${endpoint.path}`, {
    tags: { endpoint: endpoint.name },
  });

  check(response, {
    [`${endpoint.name} list returns 200`]: (result) => result.status === 200,
  });
}
