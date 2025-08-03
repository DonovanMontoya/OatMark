import React, {forwardRef, useImperativeHandle, useRef} from "react";
import {StyleSheet, View} from "react-native";
import MapView, {Marker, UrlTile} from "react-native-maps";

const FreeMapView = forwardRef(
    (
        {
            style,
            initialRegion,
            region,
            onPress,
            showsUserLocation = true,
            scrollEnabled = true,
            zoomEnabled = true,
            rotateEnabled = true,
            pitchEnabled = true,
            children,
            isDark = false,
            markers = [],
            customMapStyle = [],
            ...props
        },
        ref,
    ) => {
        const mapRef = useRef(null);

        useImperativeHandle(ref, () => ({
            animateToRegion: (region, duration = 1000) => {
                if (mapRef.current) {
                    mapRef.current.animateToRegion(region, duration);
                }
            },
            animateToCoordinate: (coordinate, duration = 1000) => {
                if (mapRef.current) {
                    const region = {
                        latitude: coordinate.latitude,
                        longitude: coordinate.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    };
                    mapRef.current.animateToRegion(region, duration);
                }
            },
            getCamera: () => {
                return mapRef.current?.getCamera();
            },
        }));

        // Determine tile URL based on the theme
        const getTileUrl = () => {
            if (isDark) {
                // Dark theme - use CartoDB Dark Matter tiles
                return "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png";
            } else {
                // Light theme - use standard OpenStreetMap tiles
                return "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png";
            }
        };

        return (
            <View style={[styles.container, style]}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    mapType="none" // Use 'none' to show custom tiles only
                    showsUserLocation={showsUserLocation}
                    initialRegion={initialRegion}
                    region={region}
                    onPress={onPress}
                    scrollEnabled={scrollEnabled}
                    zoomEnabled={zoomEnabled}
                    rotateEnabled={rotateEnabled}
                    pitchEnabled={pitchEnabled}
                    showsPointsOfInterest={false}
                    showsBuildings={false}
                    showsTraffic={false}
                    showsIndoors={false}
                    customMapStyle={customMapStyle}
                    {...props}
                >
                    <UrlTile
                        urlTemplate={getTileUrl()}
                        maximumZ={19}
                        minimumZ={1}
                        tileSize={256}
                        flipY={false}
                        shouldReplaceMapContent={true}
                        tileCachePath="/tiles"
                        tileCacheMaxAge={86400} // 24 hours
                    />

                    {/* Render markers */}
                    {markers.map((marker, index) => (
                        <Marker
                            key={marker.key || index}
                            coordinate={{
                                latitude: marker.coordinate.latitude,
                                longitude: marker.coordinate.longitude,
                            }}
                            title={marker.title}
                            description={marker.description}
                            pinColor={marker.pinColor || "#FF3B30"}
                            {...marker.props}
                        />
                    ))}

                    {/* Custom children components - these should only be MapView-compatible components */}
                    {children}
                </MapView>
            </View>
        );
    },
);

// Simple wrapper for easier migration from Google Maps
export const FreeMapViewSimple = forwardRef((props, ref) => {
    return <FreeMapView {...props} ref={ref}/>;
});

// Advanced wrapper with more tile options
export const FreeMapViewAdvanced = forwardRef(
    ({tileSource = "openStreetMap", ...props}, ref) => {
        const tileUrls = {
            openStreetMap: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
            cartoLight: "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            cartoDark: "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
            openTopoMap: "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
            wikimedia: "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png",
            stamenTerrain: "https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png",
            stamenWatercolor: "https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg",
        };

        return (
            <View style={[styles.container, props.style]}>
                <MapView
                    ref={ref}
                    style={styles.map}
                    mapType="none"
                    {...props}
                >
                    <UrlTile
                        urlTemplate={tileUrls[tileSource] || tileUrls.openStreetMap}
                        maximumZ={19}
                        minimumZ={1}
                        tileSize={256}
                        flipY={false}
                        shouldReplaceMapContent={true}
                    />
                    {props.children}
                </MapView>
            </View>
        );
    },
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
});

FreeMapView.displayName = "FreeMapView";
FreeMapViewSimple.displayName = "FreeMapViewSimple";
FreeMapViewAdvanced.displayName = "FreeMapViewAdvanced";

export default FreeMapView;
