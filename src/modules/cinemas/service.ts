import type { Cinema } from "./types.js";

const cinemas: Cinema[] = [
  {
    id: "cinema-mumbai-central",
    name: "Orbit Cinema",
    cityId: "city-mumbai",
    address: "Lower Parel, Mumbai",
  },
  {
    id: "cinema-delhi-central",
    name: "Starlight Cinemas",
    cityId: "city-delhi",
    address: "Connaught Place, Delhi",
  },
];

export function listCinemas(cityId?: string) {
  return cityId ? cinemas.filter((cinema) => cinema.cityId === cityId) : cinemas;
}

export function findCinema(id: string) {
  return cinemas.find((cinema) => cinema.id === id);
}
