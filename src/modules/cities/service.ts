import type { City } from "./types.js";

const cities: City[] = [
  { id: "city-mumbai", name: "Mumbai", state: "Maharashtra" },
  { id: "city-delhi", name: "Delhi", state: "Delhi" },
];

export function listCities() {
  return cities;
}

export function findCity(id: string) {
  return cities.find((city) => city.id === id);
}
