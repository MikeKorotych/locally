import { useCallback, useState } from 'react';
import type * as Location from 'expo-location';
import { formatAddress, getCurrentAddress } from '@/utils/map/address';

type Coordinates = {
  latitude: number;
  longitude: number;
};

type UseCurrentAddressResult = {
  address: string;
  addressDetails: Location.LocationGeocodedAddress | null;
  isResolving: boolean;
  resolveAddress: (coords: Coordinates) => Promise<void>;
};

export const useCurrentAddress = (): UseCurrentAddressResult => {
  const [address, setAddress] = useState('');
  const [addressDetails, setAddressDetails] =
    useState<Location.LocationGeocodedAddress | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const resolveAddress = useCallback(async (coords: Coordinates) => {
    setIsResolving(true);
    try {
      const addr = await getCurrentAddress({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setAddress(formatAddress(addr));
      setAddressDetails(addr);
    } finally {
      setIsResolving(false);
    }
  }, []);

  return { address, addressDetails, isResolving, resolveAddress };
};
