"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type GeolocationPoint = {
  latitude: number;
  longitude: number;
};

export type GeolocationContextValue = {
  coordinates: GeolocationPoint | null;
  loading: boolean;
  error: string;
  requestLocation: () => Promise<GeolocationPoint>;
};

export const GeolocationContext =
  createContext<GeolocationContextValue | null>(null);

function getLocationErrorMessage(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) {
    return "Bạn cần cho phép truy cập vị trí để tìm sân gần bạn.";
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return "Không thể xác định vị trí hiện tại của bạn.";
  }

  if (error.code === error.TIMEOUT) {
    return "Quá thời gian lấy vị trí. Vui lòng thử lại.";
  }

  return "Đã xảy ra lỗi khi lấy vị trí hiện tại.";
}

export function GeolocationProvider({ children }: { children: ReactNode }) {
  const [coordinates, setCoordinates] = useState<GeolocationPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestedLocationRef = useRef(false);

  const requestLocation = useCallback(() => {
    setLoading(true);
    setError("");

    return new Promise<GeolocationPoint>((resolve, reject) => {
      if (!navigator.geolocation) {
        const message = "Trình duyệt không hỗ trợ lấy vị trí.";
        setError(message);
        setLoading(false);
        reject(new Error(message));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          setCoordinates(nextCoordinates);
          setLoading(false);
          resolve(nextCoordinates);
        },
        (positionError) => {
          const message = getLocationErrorMessage(positionError);
          setError(message);
          setLoading(false);
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 60000,
        },
      );
    });
  }, []);

  useEffect(() => {
    if (requestedLocationRef.current) {
      return;
    }

    requestedLocationRef.current = true;
    void requestLocation().catch(() => undefined);
  }, [requestLocation]);

  const value = useMemo<GeolocationContextValue>(
    () => ({
      coordinates,
      loading,
      error,
      requestLocation,
    }),
    [coordinates, error, loading, requestLocation],
  );

  return (
    <GeolocationContext.Provider value={value}>
      {children}
    </GeolocationContext.Provider>
  );
}
