import type { Show } from "./types.js";

const shows: Show[] = [
  {
    id: "show-orbit-1",
    movieTitle: "The Last Orbit",
    cinemaId: "cinema-mumbai-central",
    cityId: "city-mumbai",
    startsAt: "2026-11-01T18:30:00+05:30",
    language: "English",
    format: "IMAX",
  },
  {
    id: "show-orbit-2",
    movieTitle: "The Last Orbit",
    cinemaId: "cinema-delhi-central",
    cityId: "city-delhi",
    startsAt: "2026-11-01T20:00:00+05:30",
    language: "English",
    format: "2D",
  },
];

export function listShows(filters: { cityId?: string; cinemaId?: string }) {
  return shows.filter(
    (show) =>
      (!filters.cityId || show.cityId === filters.cityId) &&
      (!filters.cinemaId || show.cinemaId === filters.cinemaId),
  );
}

export function findShow(id: string) {
  return shows.find((show) => show.id === id);
}
