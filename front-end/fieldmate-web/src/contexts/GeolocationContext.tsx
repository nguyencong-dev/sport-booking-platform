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
  accuracy: number;
};

export type GeolocationContextValue = {
  coordinates: GeolocationPoint | null;
  loading: boolean;
  error: string;
  requestLocation: () => Promise<GeolocationPoint>;
};

export const GeolocationContext =
  createContext<GeolocationContextValue | null>(null);

const TARGET_ACCURACY_METERS = 50;
const MAX_ACCEPTABLE_ACCURACY_METERS = 500;
const LOCATION_COLLECTION_TIMEOUT_MS = 15000;

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

function formatAccuracy(accuracy: number) {
  if (accuracy >= 1000) return `${(accuracy / 1000).toFixed(1)} km`;
  return `${Math.round(accuracy)} m`;
}

export function GeolocationProvider({ children }: { children: ReactNode }) {
  const [coordinates, setCoordinates] = useState<GeolocationPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestedLocationRef = useRef(false);
  const activeRequestRef = useRef<Promise<GeolocationPoint> | null>(null);

  const requestLocation = useCallback(() => {
    if (coordinates) return Promise.resolve(coordinates);
    if (activeRequestRef.current) return activeRequestRef.current;

    setLoading(true);
    setError("");

    const request = new Promise<GeolocationPoint>((resolve, reject) => {
      if (!navigator.geolocation) {
        const message = "Trình duyệt không hỗ trợ lấy vị trí.";
        setError(message);
        setLoading(false);
        reject(new Error(message));
        return;
      }

      let bestLocation: GeolocationPoint | null = null;
      let watchId: number | null = null;
      let settled = false;

      const cleanup = () => {
        window.clearTimeout(timeoutId);
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      };

      const finishWithLocation = (location: GeolocationPoint) => {
        if (settled) return;
        settled = true;
        cleanup();
        setCoordinates(location);
        setLoading(false);
        resolve(location);
      };

      const finishWithError = (message: string) => {
        if (settled) return;
        settled = true;
        cleanup();
        setError(message);
        setLoading(false);
        reject(new Error(message));
      };

      const timeoutId = window.setTimeout(() => {
        if (bestLocation && bestLocation.accuracy <= MAX_ACCEPTABLE_ACCURACY_METERS) {
          finishWithLocation(bestLocation);
          return;
        }

        const message = bestLocation
          ? `Vị trí hiện tại có sai số khoảng ${formatAccuracy(bestLocation.accuracy)}. Vui lòng thử lại ở nơi có tín hiệu tốt hơn.`
          : "Không thể xác định vị trí hiện tại của bạn.";
        finishWithError(message);
      }, LOCATION_COLLECTION_TIMEOUT_MS);

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const nextCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };

          if (!bestLocation || nextCoordinates.accuracy < bestLocation.accuracy) bestLocation = nextCoordinates;
          if (nextCoordinates.accuracy <= TARGET_ACCURACY_METERS) finishWithLocation(nextCoordinates);
        },
        (positionError) => {
          finishWithError(getLocationErrorMessage(positionError));
        },
        {
          enableHighAccuracy: true,
          timeout: LOCATION_COLLECTION_TIMEOUT_MS + 1000,
          maximumAge: 0,
        },
      );
    });

    activeRequestRef.current = request;
    void request.then(
      () => {
        if (activeRequestRef.current === request) activeRequestRef.current = null;
      },
      () => {
        if (activeRequestRef.current === request) activeRequestRef.current = null;
      },
    );

    return request;
  }, [coordinates]);

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
