export type WardResponse = {
  name: string;
};

export type ProvinceResponse = {
  name: string;
  wards: WardResponse[];
};
