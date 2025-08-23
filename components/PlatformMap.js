import React from "react";
import { Platform } from "react-native";
import MapView from "react-native-maps";
import FreeMapView from "./FreeMapView";

const PlatformMap = (props) => {
    return Platform.OS === "android" ? (
        <FreeMapView {...props} />
    ) : (
        <MapView {...props} />
    );
};

export default PlatformMap;