import React, { useEffect, useState } from 'react'

// Import the necessary components from OpenLayers
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import { OSM } from 'ol/source'
import { Circle as CircleStyle, Fill, Stroke, Style, RegularShape } from 'ol/style.js';

import MapLayers from './MapLayers'
import BufferedLayer from './BufferedLayer'

const bufferLayer = {
    filename: "layers/MadawaskaRiver.geojson",
    style: new Style({
        fill: new Fill({
            color: 'rgba(42, 183, 255, 0.3)',
        }),
        stroke: new Stroke({
            color: 'rgb(42, 183, 255)',
            width: 2
        })
    })
}

const jsonLayers = [
    {
        filename: "layers/AccessPoints.geojson",
        style: new Style({
            image: new CircleStyle({
                radius: 8,
                fill: new Fill({
                    color: 'rgba(207, 232, 17, 0.431)'
                }),
                stroke: new Stroke({
                    color: 'rgba(250, 249, 14, 0.988)',
                    width: 1
                })
            })
        }),
        zIndex: 4
    },
    {
        filename: "layers/Campsites.geojson",
        style: new Style({
            image: new RegularShape({
                fill: new Fill({
                    color: 'rgba(0, 255, 119, 0.5)'
                }),
                stroke: new Stroke({
                    color: 'rgba(6, 140, 69, 0.922)',
                    width: 1
                }),
                points: 3,
                radius: 10,
                angle: 0,
            })
        }),
        zIndex: 3
    },
    {
        filename: "layers/MadRapids.geojson",
        style: new Style({
            stroke: new Stroke({
                color: 'rgb(255, 82, 84)',
                width: 2
            })
        })
    },
    {
        filename: "layers/MadRapidsSpot.geojson",
        style: new Style({
            image: new CircleStyle({
                radius: 10,
                fill: new Fill({
                    color: 'rgba(199, 114, 74, 0.478)'
                }),
                stroke: new Stroke({
                    color: 'rgba(232, 74, 34, 0.839)',
                    width: 2
                })
            })
        })
    }
]

function BaseMap() {
    const [map, setMap] = useState(null); // Store the map instance

    // Use effect will make sure that the map is continuously rendered every time it changes
    useEffect(() => {

        // Create a map instance
        const olMap = new Map({
            layers: [
                new TileLayer({
                    source: new OSM()
                })
            ],
            view: new View({
                center: [0, 0],
                zoom: 2
            }),
            controls: [],
            target: 'map',
        });

        // Store the map and vector source instances
        setMap(olMap);

        return () => {
            olMap.setTarget(null); // Cleanup on unmount
        };

    }, []);

    return (
        // Return a <div> item with style set so that it covers the entire screen
        <div>
            <div id="map" style={{ width: "100vw", height: "100vh" }} />
            {map && (<MapLayers map={map} layers={jsonLayers} />)}
            {map && (<BufferedLayer map={map} layer={bufferLayer} zIndex={1} />)}
        </div>
    )
}

export default BaseMap