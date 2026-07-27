export type VenueStatus =
  | "PENDING"
  | "ACTIVE"
  | "INACTIVE"
  | "REJECTED";

export type VenueSummaryResponse = {
  id: number;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  banner: string | null;
  logo: string | null;
  status: VenueStatus;
};

export type VenueDetailResponse = VenueSummaryResponse & {
  ownerId: number;
  ownerName: string;
  benefits: string[];
  rules: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export type VenueUpsertRequest = {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  banner?: File | null;
  logo?: File | null;
};
