import '@rnmapbox/maps';

declare module '@rnmapbox/maps' {
  import { ViewProps } from 'react-native';
  interface VectorSourceProps extends ViewProps {
    promoteId?: string;
  }
}
