// MapLibre configuration for free mapping without API keys
export const mapLibreConfig = {
    // Free OpenStreetMap style - no API key required
    styleURL: 'https://demotiles.maplibre.org/style.json',


    // Default map configuration
    defaultZoom: 15,
    defaultCenter: {
        latitude: 37.7749,
        longitude: -122.4194
    },

    // Map style for dark mode
    darkStyleURL: 'https://demotiles.maplibre.org/style.json', // You can customize this for dark mode

    // Free tile sources (alternatives to the style above)
    tileSources: {
        openStreetMap: {
            type: 'raster',
            tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
        },
        openTopoMap: {
            type: 'raster',
            tiles: ['https://a.tile.opentopomap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenTopoMap contributors'
        },
        cartoDB: {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© CARTO'
        },
        cartoDBDark: {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© CARTO'
        }
    }
};

// Custom style JSON for full control (optional)
export const customMapStyle = {
    version: 8,
    sources: {
        'osm-tiles': {
            type: 'raster',
            tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
        }
    },
    layers: [
        {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19
        }
    ]
};
