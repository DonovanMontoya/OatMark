import React, {forwardRef, useImperativeHandle, useRef} from "react";
import {StyleSheet, Text, View} from "react-native";
import {Camera, MapView, MarkerView, ShapeSource, SymbolLayer,} from "@maplibre/maplibre-react-native";
import {mapLibreConfig} from "../maplibre-config";

const MapLibreView = forwardRef(
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
            ...props
        },
        ref,
    ) => {
        const mapRef = useRef(null);

        useImperativeHandle(ref, () => ({
            animateToRegion: (region, duration = 1000) => {
                if (mapRef.current) {
                    mapRef.current.setCamera({
                        centerCoordinate: [region.longitude, region.latitude],
                        zoomLevel: calculateZoomLevel(region.latitudeDelta),
                        animationDuration: duration,
                    });
                }
            },
            animateToCoordinate: (coordinate, duration = 1000) => {
                if (mapRef.current) {
                    mapRef.current.setCamera({
                        centerCoordinate: [coordinate.longitude, coordinate.latitude],
                        animationDuration: duration,
                    });
                }
            },
            getCamera: () => {
                return mapRef.current?.getCamera();
            },
        }));

        // Convert react-native-maps region to MapLibre camera
        const getCameraFromRegion = (region) => {
            if (!region) return null;

            return {
                centerCoordinate: [region.longitude, region.latitude],
                zoomLevel: calculateZoomLevel(region.latitudeDelta),
            };
        };

        // Calculate zoom level from latitude delta (approximate conversion)
        const calculateZoomLevel = (latitudeDelta) => {
            return Math.log2(360 / latitudeDelta);
        };

        // Convert markers to GeoJSON for MapLibre
        const markersGeoJSON = {
            type: "FeatureCollection",
            features: markers.map((marker, index) => ({
                type: "Feature",
                id: marker.key || index,
                geometry: {
                    type: "Point",
                    coordinates: [
                        marker.coordinate.longitude,
                        marker.coordinate.latitude,
                    ],
                },
                properties: {
                    title: marker.title || "",
                    description: marker.description || "",
                    key: marker.key || index,
                },
            })),
        };

        const handlePress = (event) => {
            if (onPress) {
                const {geometry} = event;
                onPress({
                    nativeEvent: {
                        coordinate: {
                            latitude: geometry.coordinates[1],
                            longitude: geometry.coordinates[0],
                        },
                    },
                });
            }
        };

        const initialCamera = getCameraFromRegion(initialRegion || region) || {
            centerCoordinate: [
                mapLibreConfig.defaultCenter.longitude,
                mapLibreConfig.defaultCenter.latitude,
            ],
            zoomLevel: mapLibreConfig.defaultZoom,
        };

        return (
            <View style={[styles.container, style]}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    styleURL={
                        isDark ? mapLibreConfig.darkStyleURL : mapLibreConfig.styleURL
                    }
                    onPress={handlePress}
                    scrollEnabled={scrollEnabled}
                    zoomEnabled={zoomEnabled}
                    rotateEnabled={rotateEnabled}
                    pitchEnabled={pitchEnabled}
                    showsUserLocation={showsUserLocation}
                    {...props}
                >
                    <Camera {...initialCamera} animationDuration={0}/>

                    {/* Render markers if provided */}
                    {markers.length > 0 && (
                        <>
                            <ShapeSource id="markers" shape={markersGeoJSON}>
                                <SymbolLayer
                                    id="marker-symbols"
                                    style={{
                                        iconImage: "marker-15",
                                        iconSize: 1.5,
                                        iconAnchor: "bottom",
                                        textField: ["get", "title"],
                                        textFont: ["Open Sans Regular"],
                                        textOffset: [0, -2],
                                        textAnchor: "top",
                                        textSize: 12,
                                        textColor: "#000000",
                                        textHaloColor: "#FFFFFF",
                                        textHaloWidth: 1,
                                    }}
                                />
                            </ShapeSource>
                        </>
                    )}

                    {/* Custom children components */}
                    {children}
                </MapView>
            </View>
        );
    },
);

// Alternative implementation using raster tiles (fallback if style JSON doesn't work)
export const MapLibreRasterView = forwardRef(
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
            tileSource = "openStreetMap",
            ...props
        },
        ref,
    ) => {
        const mapRef = useRef(null);

        useImperativeHandle(ref, () => ({
            animateToRegion: (region, duration = 1000) => {
                if (mapRef.current) {
                    mapRef.current.setCamera({
                        centerCoordinate: [region.longitude, region.latitude],
                        zoomLevel: Math.log2(360 / region.latitudeDelta),
                        animationDuration: duration,
                    });
                }
            },
        }));

        const tileConfig =
            mapLibreConfig.tileSources[isDark ? "cartoDBDark" : tileSource];

        const rasterStyle = {
            version: 8,
            sources: {
                "raster-tiles": tileConfig,
            },
            layers: [
                {
                    id: "raster-tiles-layer",
                    type: "raster",
                    source: "raster-tiles",
                    minzoom: 0,
                    maxzoom: 19,
                },
            ],
        };

        const initialCamera = {
            centerCoordinate: [
                (initialRegion || region)?.longitude ||
                mapLibreConfig.defaultCenter.longitude,
                (initialRegion || region)?.latitude ||
                mapLibreConfig.defaultCenter.latitude,
            ],
            zoomLevel:
                initialRegion || region
                    ? Math.log2(360 / (initialRegion || region).latitudeDelta)
                    : mapLibreConfig.defaultZoom,
        };

        return (
            <View style={[styles.container, style]}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    styleJSON={JSON.stringify(rasterStyle)}
                    onPress={onPress}
                    scrollEnabled={scrollEnabled}
                    zoomEnabled={zoomEnabled}
                    rotateEnabled={rotateEnabled}
                    pitchEnabled={pitchEnabled}
                    showsUserLocation={showsUserLocation}
                    {...props}
                >
                    <Camera {...initialCamera} animationDuration={0}/>

                    {/* Render custom markers as MarkerView components */}
                    {markers.map((marker, index) => (
                        <MarkerView
                            key={marker.key || index}
                            coordinate={[
                                marker.coordinate.longitude,
                                marker.coordinate.latitude,
                            ]}
                            anchor={{x: 0.5, y: 1}}
                        >
                            <View style={styles.markerContainer}>
                                <View style={styles.marker}/>
                                {marker.title && (
                                    <View style={styles.markerLabel}>
                                        <Text style={styles.markerText}>{marker.title}</Text>
                                    </View>
                                )}
                            </View>
                        </MarkerView>
                    ))}

                    {children}
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
    markerContainer: {
        alignItems: "center",
    },
    marker: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#FF3B30",
        borderWidth: 2,
        borderColor: "#FFFFFF",
        shadowColor: "#000000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
    markerLabel: {
        backgroundColor: "#FFFFFF",
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginTop: 4,
        shadowColor: "#000000",
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    markerText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#000000",
    },
});

MapLibreView.displayName = "MapLibreView";
MapLibreRasterView.displayName = "MapLibreRasterView";

export default MapLibreView;
