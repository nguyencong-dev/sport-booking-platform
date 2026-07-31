import { fieldmateClient } from "@/services/clients/fieldmate-client";
import type {
  HeroBannerRequest,
  HeroBannerResponse,
} from "@/types/banner";

function createBannerFormData(request: HeroBannerRequest) {
  const formData = new FormData();

  if (request.image) {
    formData.append("image", request.image);
  }

  if (request.targetUrl !== undefined) {
    formData.append("targetUrl", request.targetUrl.trim());
  }

  return formData;
}

export const bannerService = {
  async getAll() {
    const response =
      await fieldmateClient.get<HeroBannerResponse[]>("/banners");

    return response.data;
  },

  async remove(bannerId: number) {
    await fieldmateClient.delete(`/secure/banners/${bannerId}`);
  },

  async create(request: HeroBannerRequest) {
    const response = await fieldmateClient.post<HeroBannerResponse>(
      "/secure/banners",
      createBannerFormData(request),
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },

  async update(
    bannerId: number,
    request: HeroBannerRequest,
  ) {
    const response = await fieldmateClient.put<HeroBannerResponse>(
      `/secure/banners/${bannerId}`,
      createBannerFormData(request),
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },
};
