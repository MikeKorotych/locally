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

type AddressState = {
  address: string;
  addressDetails: Location.LocationGeocodedAddress | null;
};

export const useCurrentAddress = (): UseCurrentAddressResult => {
  const [addressState, setAddressState] = useState<AddressState>({
    address: '',
    addressDetails: null,
  });
  const [isResolving, setIsResolving] = useState(false);

  const resolveAddress = useCallback(async (coords: Coordinates) => {
    setIsResolving(true);
    try {
      const addr = await getCurrentAddress({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setAddressState({
        address: formatAddress(addr),
        addressDetails: addr,
      });
    } finally {
      setIsResolving(false);
    }
  }, []);

  return {
    address: addressState.address,
    addressDetails: addressState.addressDetails,
    isResolving,
    resolveAddress,
  };
};
