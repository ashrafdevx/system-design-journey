export type City = {
  id: string;
  name: string;
  state: string;
};

export type CityInput = Omit<City, "id">;
