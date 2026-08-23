"use client";

import { useCallback, useState } from "react";

export type GeolocationPoint = {
  latitude: number;
  longitude: number;
};

function getLocationErrorMessage(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) {
    return "Bạn cần cho phép truy cập vị trí để lọc sân theo khoảng cách.";
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return "Không thể xác định vị trí hiện tại của bạn.";
  }

  if (error.code === error.TIMEOUT) {
    return "Quá thời gian lấy vị trí. Vui lòng thử lại.";
  }

  return "Đã xảy ra lỗi khi lấy vị trí hiện tại.";
}

export function useGeolocation() {
  const [coordinates, setCoordinates] = useState<GeolocationPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
          timeout: 10000,
          maximumAge: 60000,
        },
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    setCoordinates(null);
    setError("");
  }, []);

  return {
    coordinates,
    loading,
    error,
    requestLocation,
    clearLocation,
  };
}
