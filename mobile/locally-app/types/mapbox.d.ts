import '@rnmapbox/maps';

declare module '@rnmapbox/maps' {
  import { ViewProps } from 'react-native';
  interface MapViewProps extends ViewProps {
    interactiveLayerIds?: string[];
  }
  interface VectorSourceProps extends ViewProps {
    promoteId?: string;
  }
}
