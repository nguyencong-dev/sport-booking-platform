import axios from "axios";
import cookies from "react-cookies";

import { API_CONFIG } from "@/configs/api.config";

export const fieldmateEndpoints = {
  login: "/auth/login",
  register: "/auth/register",
  banners: "/banners",
  secureBanners: "/secure/banners",
  secureBanner: (bannerId: number) => `/secure/banners/${bannerId}`,
  secureVenueBenefits: (venueId: number) =>
    `/secure/venues/${venueId}/benefits`,
  secureBenefit: (benefitId: number) =>
    `/secure/benefits/${benefitId}`,
  secureBookings: "/secure/bookings",
  myBookings: "/secure/bookings/me",
  secureBooking: (bookingId: number) =>
    `/secure/bookings/${bookingId}`,
  secureVenueBookings: (venueId: number) =>
    `/secure/venues/${venueId}/bookings`,
  completeBooking: (bookingId: number) =>
    `/secure/bookings/${bookingId}/complete`,
  ownerRevenueStatistics: "/secure/owner/statistics/revenue",
  ownerBookingStatistics: "/secure/owner/statistics/bookings",
  ownerPeakHourStatistics: "/secure/owner/statistics/peak-hours",
  ownerCourtRanking: "/secure/owner/statistics/courts/ranking",
  venueCourts: (venueId: number) => `/venues/${venueId}/courts`,
  court: (courtId: number) => `/courts/${courtId}`,
  secureVenueCourts: (venueId: number) =>
    `/secure/venues/${venueId}/courts`,
  secureCourt: (courtId: number) => `/secure/courts/${courtId}`,
  paymentAccounts: "/secure/payment-accounts",
  myPaymentAccounts: "/secure/payment-accounts/me",
  paymentAccount: (accountId: number) =>
    `/secure/payment-accounts/${accountId}`,
  momoPaymentAccounts: "/secure/payment-accounts/momo",
  vnPayPaymentAccounts: "/secure/payment-accounts/vnpay",
  momoPaymentAccount: (accountId: number) =>
    `/secure/payment-accounts/${accountId}/momo`,
  vnPayPaymentAccount: (accountId: number) =>
    `/secure/payment-accounts/${accountId}/vnpay`,
  activatePaymentAccount: (accountId: number) =>
    `/secure/payment-accounts/${accountId}/active`,
  deactivatePaymentAccount: (accountId: number) =>
    `/secure/payment-accounts/${accountId}/inactive`,
  paymentAccountStatus: (accountId: number) =>
    `/secure/payment-accounts/${accountId}/status`,
  bookingPayments: (bookingId: number) =>
    `/secure/bookings/${bookingId}/payments`,
  bookingCashPayments: (bookingId: number) =>
    `/secure/bookings/${bookingId}/cash-payments`,
  payment: (paymentId: number) => `/secure/payments/${paymentId}`,
  secureVenueRules: (venueId: number) =>
    `/secure/venues/${venueId}/rules`,
  secureRule: (ruleId: number) => `/secure/rules/${ruleId}`,
  sportTypes: "/sport-types",
  secureSportTypes: "/secure/sport-types",
  secureSportType: (sportTypeId: number) =>
    `/secure/sport-types/${sportTypeId}`,
  currentUser: "/secure/users/me",
  users: "/secure/users",
  user: (userId: number) => `/secure/users/${userId}`,
  userEnabled: (userId: number) =>
    `/secure/users/${userId}/enabled`,
  userRole: (userId: number) => `/secure/users/${userId}/role`,
  secureVenueImages: (venueId: number) =>
    `/secure/venues/${venueId}/images`,
  secureImage: (imageId: number) => `/secure/images/${imageId}`,
  venues: "/venues",
  venue: (venueId: number) => `/venues/${venueId}`,
  venueBookingSchedule: (venueId: number) =>
    `/venues/${venueId}/booking-schedule`,
  myVenues: "/secure/venues/me",
  pendingVenues: "/secure/venues/pending",
  secureVenues: "/secure/venues",
  secureVenue: (venueId: number) => `/secure/venues/${venueId}`,
  venueStatus: (venueId: number) =>
    `/secure/venues/${venueId}/status`,
} as const;

if (!API_CONFIG.fieldmateURL) {
  throw new Error("NEXT_PUBLIC_FIELDMATE_API_URL chưa được cấu hình");
}

export const fieldmateClient = axios.create({
  baseURL: API_CONFIG.fieldmateURL,
  timeout: API_CONFIG.timeout,
  headers: {
    Accept: "application/json",
  },
});

fieldmateClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = cookies.load("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

fieldmateClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url === fieldmateEndpoints.login;

    if (
      typeof window !== "undefined" &&
      error.response?.status === 401 &&
      !isLoginRequest
    ) {
      cookies.remove("token", {
        path: "/",
      });

      window.location.replace("/login");
    }

    return Promise.reject(error);
  },
);
