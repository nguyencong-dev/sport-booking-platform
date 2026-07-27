import { fieldmateClient } from "@/services/clients/fieldmate-client";
import type { VenueImageResponse } from "@/types/venue-image";

export const venueImageService = {
  async upload(venueId: number, images: File[]) {
    const formData = new FormData();

    images.forEach((image) => {
      formData.append("images", image);
    });

    const response = await fieldmateClient.post<VenueImageResponse[]>(
      `/secure/venues/${venueId}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },

  async remove(imageId: number) {
    await fieldmateClient.delete(`/secure/images/${imageId}`);
  },
};
