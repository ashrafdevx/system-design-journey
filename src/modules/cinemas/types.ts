export type Cinema = {
  id: string;
  name: string;
  cityId: string;
  address: string;
};

export type CinemaInput = Omit<Cinema, "id">;
