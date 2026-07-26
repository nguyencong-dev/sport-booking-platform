import cookies from "react-cookies";

import type { BookingRequest } from "@/types/booking";

const BOOKING_DRAFT_COOKIE = "bookingDraft";

export type BookingDraft = BookingRequest & {
  bookingId?: number;
};

function isBookingDraft(value: unknown): value is BookingDraft {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Partial<BookingDraft>;

  return (
    typeof draft.courtId === "number" &&
    typeof draft.bookingDate === "string" &&
    typeof draft.startTime === "string" &&
    typeof draft.endTime === "string"
  );
}

export const bookingDraftService = {
  save(draft: BookingDraft) {
    cookies.save(BOOKING_DRAFT_COOKIE, draft, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 30,
    });
  },

  load(): BookingDraft | null {
    const value = cookies.load(BOOKING_DRAFT_COOKIE);

    if (isBookingDraft(value)) {
      return value;
    }

    if (typeof value === "string") {
      try {
        const parsedValue: unknown = JSON.parse(value);

        return isBookingDraft(parsedValue) ? parsedValue : null;
      } catch {
        return null;
      }
    }

    return null;
  },

  remove() {
    cookies.remove(BOOKING_DRAFT_COOKIE, {
      path: "/",
    });
  },
};
