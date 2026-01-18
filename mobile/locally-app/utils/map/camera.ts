import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type Mapbox from '@rnmapbox/maps';
import type * as Location from 'expo-location';

type CameraSettings = {
  centerCoordinate: [number, number];
  zoomLevel: number;
  pitch: number;
  heading: number;
  animationMode?: 'flyTo';
  animationDuration?: number;
};

type UseMapCameraOptions = {
  initialCenter: [number, number];
  initialZoom?: number;
  pitch?: number;
};

export const useMapCamera = ({
  initialCenter,
  initialZoom = 18,
  pitch = 60,
}: UseMapCameraOptions) => {
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [cameraSettings, setCameraSettings] =
    useState<CameraSettings | null>(null);
  const cameraClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const initialCamera = useMemo(
    () => ({
      centerCoordinate: initialCenter,
      zoomLevel: initialZoom,
      pitch,
    }),
    [initialCenter, initialZoom, pitch]
  );

  const setCameraToCoordinate = useCallback(
    (
      centerCoordinate: [number, number],
      animationDuration = 800,
      zoomLevel = initialZoom
    ) => {
      if (cameraClearTimeoutRef.current) {
        clearTimeout(cameraClearTimeoutRef.current);
        cameraClearTimeoutRef.current = null;
      }
      setCameraSettings({
        centerCoordinate,
        zoomLevel,
        pitch,
        heading: 0,
        animationMode: animationDuration > 0 ? 'flyTo' : undefined,
        animationDuration: animationDuration > 0 ? animationDuration : undefined,
      });
      const resetDelay = animationDuration > 0 ? animationDuration + 200 : 200;
      cameraClearTimeoutRef.current = setTimeout(() => {
        setCameraSettings(null);
        cameraClearTimeoutRef.current = null;
      }, resetDelay);
    },
    [initialZoom, pitch]
  );

  const setCameraToLocation = useCallback(
    (location: Location.LocationObject, animationDuration = 800) =>
      setCameraToCoordinate(
        [location.coords.longitude, location.coords.latitude],
        animationDuration
      ),
    [setCameraToCoordinate]
  );

  const handleCameraChanged = useCallback((event: any) => {
    const typedEvent = event as CameraChangedEvent | null | undefined;
    const isUserInteraction =
      typedEvent?.properties?.isUserInteraction ??
      typedEvent?.gestures?.isUserInteraction;
      if (!isUserInteraction) {
        return;
      }
      if (cameraClearTimeoutRef.current) {
        clearTimeout(cameraClearTimeoutRef.current);
        cameraClearTimeoutRef.current = null;
      }
      setCameraSettings(null);
  }, []);

  useEffect(() => {
    return () => {
      if (cameraClearTimeoutRef.current) {
        clearTimeout(cameraClearTimeoutRef.current);
        cameraClearTimeoutRef.current = null;
      }
    };
  }, []);

  return {
    cameraRef,
    cameraSettings,
    initialCamera,
    setCameraToCoordinate,
    setCameraToLocation,
    onCameraChanged: handleCameraChanged,
  };
};
type CameraChangedEvent = {
  properties?: {
    isUserInteraction?: boolean;
  };
  gestures?: {
    isUserInteraction?: boolean;
  };
};
