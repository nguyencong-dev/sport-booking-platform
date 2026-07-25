export type CourtStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

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
