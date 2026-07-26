import axios from "axios";

import type { ProvinceResponse } from "@/types/province";

type ProvinceApiResponse = {
  name: string;
  wards?: {
    name: string;
  }[];
};

const provinceClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PROVINCE_API_URL,
  timeout: 10_000,
});

export const provinceService = {
  async getAllWithWards(): Promise<ProvinceResponse[]> {
    const response = await provinceClient.get<ProvinceApiResponse[]>("/", {
      params: {
        depth: 2,
      },
    });

    return response.data.map((province) => ({
      name: province.name,
      wards: (province.wards ?? []).map((ward) => ({
        name: ward.name,
      })),
    }));
  },
};
