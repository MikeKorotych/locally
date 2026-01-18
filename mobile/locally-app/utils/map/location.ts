import { useCallback, useRef, useState } from 'react';
import * as Location from 'expo-location';

type UseUserLocationResult = {
  isLocating: boolean;
  locationRef: React.MutableRefObject<Location.LocationObject | null>;
  requestAndLoadLocation: () => Promise<Location.LocationObject | null>;
};

export const useUserLocation = (): UseUserLocationResult => {
  const locationRef = useRef<Location.LocationObject | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const requestAndLoadLocation = useCallback(async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      locationRef.current = current;
      return current;
    } finally {
      setIsLocating(false);
    }
  }, []);

  return {
    isLocating,
    locationRef,
    requestAndLoadLocation,
  };
};
