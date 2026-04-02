// Web mock for react-native-maps
import React from 'react';
import { View, Text } from 'react-native';

const MapView = React.forwardRef((props, ref) => (
  <View ref={ref} style={[{ flex: 1, backgroundColor: '#1a2035', justifyContent: 'center', alignItems: 'center' }, props.style]}>
    <Text style={{ color: '#94a3b8', fontSize: 14 }}>🗺️ Map View</Text>
    {props.children}
  </View>
));

MapView.Marker = (props) => (
  <View style={{ position: 'absolute' }}>
    {props.children}
  </View>
);

MapView.Callout = (props) => <View>{props.children}</View>;
MapView.Polyline = () => null;
MapView.Polygon = () => null;
MapView.Circle = () => null;
MapView.Heatmap = () => null;
MapView.UrlTile = () => null;
MapView.LocalTile = () => null;
MapView.Overlay = () => null;
MapView.PROVIDER_GOOGLE = 'google';
MapView.PROVIDER_DEFAULT = 'default';

export default MapView;
export { MapView };
