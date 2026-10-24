export type CitySeed = {
  id: string;
  name: string;
  state: string;
};

export type CinemaSeed = {
  id: string;
  name: string;
  cityId: string;
  address: string;
};

export type ShowSeed = {
  id: string;
  movieTitle: string;
  cinemaId: string;
  cityId: string;
  startsAt: string;
  language: string;
  format: string;
};

export const cities: CitySeed[] = [
  { id: "650000000000000000000001", name: "Mumbai", state: "Maharashtra" },
  { id: "650000000000000000000002", name: "Delhi", state: "Delhi" },
  { id: "650000000000000000000003", name: "Bengaluru", state: "Karnataka" },
];

export const cinemas: CinemaSeed[] = [
  {
    id: "651000000000000000000001",
    name: "Harbour Point Cinemas",
    cityId: "650000000000000000000001",
    address: "Lower Parel, Mumbai",
  },
  {
    id: "651000000000000000000002",
    name: "Crescent Multiplex",
    cityId: "650000000000000000000001",
    address: "Andheri West, Mumbai",
  },
  {
    id: "651000000000000000000003",
    name: "Capital Square Cinemas",
    cityId: "650000000000000000000002",
    address: "Connaught Place, New Delhi",
  },
  {
    id: "651000000000000000000004",
    name: "Garden City Screens",
    cityId: "650000000000000000000003",
    address: "Indiranagar, Bengaluru",
  },
];

export const shows: ShowSeed[] = [
  {
    id: "652000000000000000000001",
    movieTitle: "The Last Orbit",
    cinemaId: "651000000000000000000001",
    cityId: "650000000000000000000001",
    startsAt: "2026-11-01T18:30:00+05:30",
    language: "English",
    format: "IMAX",
  },
  {
    id: "652000000000000000000002",
    movieTitle: "The Last Orbit",
    cinemaId: "651000000000000000000002",
    cityId: "650000000000000000000001",
    startsAt: "2026-11-01T20:00:00+05:30",
    language: "English",
    format: "2D",
  },
  {
    id: "652000000000000000000003",
    movieTitle: "Monsoon Letters",
    cinemaId: "651000000000000000000003",
    cityId: "650000000000000000000002",
    startsAt: "2026-11-02T17:45:00+05:30",
    language: "Hindi",
    format: "2D",
  },
  {
    id: "652000000000000000000004",
    movieTitle: "Monsoon Letters",
    cinemaId: "651000000000000000000004",
    cityId: "650000000000000000000003",
    startsAt: "2026-11-02T19:15:00+05:30",
    language: "Kannada",
    format: "2D",
  },
];
