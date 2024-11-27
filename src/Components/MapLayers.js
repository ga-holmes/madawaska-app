import { useEffect, useState } from 'react'

// Import the necessary components from OpenLayers
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON.js';
import {Select} from'ol/interaction.js'
import { click } from 'ol/events/condition';
import Overlay from 'ol/Overlay';
import { toLonLat } from 'ol/proj';

function MapLayers({layers, map}) {

    const [selectedDetails, setSelectedDetails] = useState('')
    const [selectedCoordinates, setSelectedCoordinates] = useState(null); // Store coordinates of the selected feature

    // Use effect will make sure that the map is continuously rendered every time it changes
    useEffect(() => {
        // Error checking
        if (!map || !layers || layers.length === 0) return;

        // Create the overlay for displaying the selected feature's name
        const infoOverlay = new Overlay({
            element: document.createElement('div'),
            positioning: 'center-center', // Position it at the bottom center of the selected feature
            stopEvent: true, // Prevent map events from being blocked by the overlay
        });

        map.addOverlay(infoOverlay); // Add overlay to the map

        const vectorLayers = []

        // Create a layer for each geojson and add it to the map
        layers.forEach((geojson) => {

            const vectorSource = new VectorSource({
                url: geojson.filename,
                format: new GeoJSON()
            })

            const vectorLayer = new VectorLayer({
                source: vectorSource,
                opacity: 1,
                zIndex: geojson.zIndex ? geojson.zIndex : 2,
                style: geojson.style
            })

            vectorLayers.push(vectorLayer);
            map.addLayer(vectorLayer);

        });

        // Get the source of the layer with the largest extent
        let source = null;

        vectorLayers.forEach(layer => {
            const extent = layer.getSource().getExtent();

            if (source == null){
                source = layer.getSource()
            } else if (source.getExtent() < extent){
                source = layer.getSource()
            }

        });

        // Change the extent to the largest one
        source.once('addfeature', () => {
            // Get the extent of the vector layer once features are loaded
            const extent = source.getExtent();
            map.getView().fit(extent, { padding: [100, 100, 100, 100] });
        });

        // Set up the Select interaction
        const selectInteraction = new Select({
            condition: click,
            layers: vectorLayers,
        });

        selectInteraction.on('select', (event) => {
            const feature = event.selected[0]; // Get the first selected feature
            
            if (feature) {
                const name = feature.get('Name'); // Extract the "Name" attribute
                const geometry = feature.getGeometry(); // Get the geometry of the feature
                const coordinates = geometry.getCoordinates(); // Get the coordinates of the feature's geometry

                // Set the name and coordinates for positioning the overlay
                setSelectedDetails(name);
                setSelectedCoordinates(toLonLat(coordinates)); // Convert to EPSG:4326
                // Position the overlay at the coordinates of the selected feature
                infoOverlay.setPosition(toLonLat(coordinates)); // Set position of overlay on the map
            } else {
                setSelectedDetails(null); // Reset if no feature is selected
                setSelectedCoordinates(null);
                infoOverlay.setPosition(undefined); // Hide the overlay if no selection
            }
        });

        map.addInteraction(selectInteraction);

        return () => {
            map.removeInteraction(selectInteraction);
            layers.forEach((layer) => map.removeLayer(layer)); // Cleanup on unmount
            map.removeOverlay(infoOverlay);
        };
        
    }, [map, layers]);

    return (
        <>
            {selectedDetails && selectedCoordinates && (
                <div
                    style={{
                        position: 'absolute',
                        top: '40px',   // Position it just below the selected feature's coordinates
                        right: '40px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        padding: '10px',
                        borderRadius: '5px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,        // Ensure it appears above the map
                        fontSize: '12px',
                        fontWeight: 'bold',
                    }}
                >
                    <h1>{selectedDetails}</h1>
                    <p>{"Longitude: "}{selectedCoordinates[0].toFixed(6)}</p>
                    <p>{"Latitude: "}{selectedCoordinates[1].toFixed(6)}</p>
                </div>
            )}
        </>
    );
}

export default MapLayers