import * as Location from 'expo-location';

type Address = Location.LocationGeocodedAddress | null;

type Coordinates = {
  latitude: number;
  longitude: number;
};

export const getCurrentAddress = async (
  coords: Coordinates
): Promise<Address> => {
  const results = await Location.reverseGeocodeAsync({
    latitude: coords.latitude,
    longitude: coords.longitude,
  });
  return results[0] ?? null;
};

export const formatAddress = (address: Address) => {
  if (!address) {
    return '';
  }
  const streetLine = [address.street, address.streetNumber]
    .filter(Boolean)
    .join(' ');
  const parts = [
    address.name,
    streetLine,
    address.city,
    address.region,
    address.postalCode,
    address.country,
  ].filter(Boolean);
  return parts.join(', ');
};
