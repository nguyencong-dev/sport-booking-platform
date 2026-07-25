import { fieldmateClient } from "@/services/clients/fieldmate-client";
import type { HeroBannerResponse } from "@/types/banner";

export const bannerService = {
  async getAll() {
    const response =
      await fieldmateClient.get<HeroBannerResponse[]>("/banners");

    return response.data;
  },
};
