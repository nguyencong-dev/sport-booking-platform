"use client";

import { useContext } from "react";

import { GeolocationContext } from "@/contexts/GeolocationContext";

export type { GeolocationPoint } from "@/contexts/GeolocationContext";

export function useGeolocation() {
  const context = useContext(GeolocationContext);

  if (!context) {
    throw new Error(
      "useGeolocation phải được sử dụng bên trong GeolocationProvider",
    );
  }

  return context;
}
