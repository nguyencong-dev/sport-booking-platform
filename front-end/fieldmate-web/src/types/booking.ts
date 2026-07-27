export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "EXPIRED";

export type BookingRequest = {
  courtId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
};

export type BookingResponse = {
  id: number;
  customerId: number;
  customerName: string;
  courtId: number;
  courtName: string;
  venueName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  requiredDeposit: number;
  paidAmount: number;
  remainingAmount: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
};

export type BookedPeriodResponse = {
  bookingId: number;
  startTime: string;
  endTime: string;
};

export type CourtBookingScheduleResponse = {
  courtId: number;
  courtName: string;
  bookedPeriods: BookedPeriodResponse[];
};

export type VenueBookingScheduleResponse = {
  venueId: number;
  date: string;
  courts: CourtBookingScheduleResponse[];
};
