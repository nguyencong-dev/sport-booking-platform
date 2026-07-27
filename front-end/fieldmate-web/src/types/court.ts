export type CourtStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

export type CourtRequest = {
  name: string;
  pricePerHour: number;
  sportTypeId: number;
};

export type CourtResponse = {
  id: number;
  name: string;
  pricePerHour: number;
  status: CourtStatus;
  sportTypeName: string;
  venueName: string;
  createdAt: string;
  updatedAt: string;
};
