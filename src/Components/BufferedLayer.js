import React, { useEffect, useState } from 'react'

// Import the necessary components from OpenLayers
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON.js';
import { toLonLat } from 'ol/proj'

import LevelSlider from './LevelSlider'

// turf.js
import { buffer, polygon } from '@turf/turf'

function BufferedLayer({ map, layer, zIndex }) {

    // This source is only used to display the buffered vector
    const [vectorSource, setVectorSource] = useState(null); // Store the vector source
    // Keep track of the original geometry to apply the buffer to
    const [baseSource, setBaseSource] = useState(null)

    // Use effect will make sure that the map is continuously rendered every time it changes
    useEffect(() => {

        if (!map) return;

        const vectorSource = new VectorSource({
            url: layer.filename,
            format: new GeoJSON()
        });

        const baseSource = new VectorSource();

        const vectorLayer = new VectorLayer({
            source: vectorSource,
            opacity: 1,
            zIndex: zIndex,
            style: layer.style
        });

        // Store the vector source instance and add it to the map
        map.addLayer(vectorLayer)

        // Once vectorSource has finished loading, copy its features to baseSource to maintain independence from vectorSource
        vectorSource.once('change', () => {
            if (vectorSource.getState() === 'ready') {
                // Get all features from vectorSource and add them to baseSource
                const features = vectorSource.getFeatures();
                baseSource.addFeatures(features);

                setBaseSource(baseSource);
            }
        });

        setVectorSource(vectorSource);

        return () => {
            map.removeLayer(vectorLayer); // Cleanup on unmount
        };

    }, [map, layer, zIndex]);

    // Function to handle buffer updates from the slider
    const handleBufferChange = (distance) => {

        if (!vectorSource || !baseSource) return;

        const features = baseSource.getFeatures();
        if (features.length === 0) return;

        // Get geometry from the first feature
        const originalGeometry = features[0].getGeometry();
        const coordinates = originalGeometry.getCoordinates()[0].map((coord) => toLonLat(coord));

        // Ensure the polygon is closed
        if (
            JSON.stringify(coordinates[0]) !==
            JSON.stringify(coordinates[coordinates.length - 1])
        ) {
            coordinates.push(coordinates[0]); // Close the ring
        }

        // Create a Turf.js polygon and buffer it
        const turfPolygon = polygon([coordinates]);
        const buffered = buffer(turfPolygon, distance, { units: 'meters', joing: 'miter' });

        // **Validation Step**: Check if the buffer resulted in a valid polygon
        const bufferedCoordinates = buffered?.geometry?.coordinates;

        if (bufferedCoordinates && bufferedCoordinates[0]?.length < 4) {
            console.warn('Buffer operation resulted in an invalid polygon.');
        }

        // Convert the buffered GeoJSON back to EPSG:3857 (for the map)
        const bufferedFeature = new GeoJSON().readFeature(buffered, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857',
        });

        // Clear the vector source and add the buffered feature
        vectorSource.clear();
        vectorSource.addFeature(bufferedFeature);
    };

    return (
        <div style={{
            position: 'absolute',
            bottom: '10px', // Position it 10px from the bottom of the map
            left: '10px',  // Position it 10px from the right of the map
            background: 'rgba(255, 255, 255, 0.8)', // Opaque background
            padding: '10px',
            borderRadius: '5px', // Rounded corners
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Optional shadow for better visibility
            zIndex: 1000, // Ensure it appears above the map
        }
}>
            <LevelSlider min={-0.9} max={3.2} initialValue={-0.9} step={0.1} onChange={handleBufferChange} />
        </div>
    )
}

BufferedLayer.defaultProps = {
    zIndex: 2
}

export default BufferedLayer