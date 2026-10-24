export type Show = {
  id: string;
  movieTitle: string;
  cinemaId: string;
  cityId: string;
  startsAt: string;
  language: string;
  format: string;
};

export type ShowInput = Omit<Show, "id">;
