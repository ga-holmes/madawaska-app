# Creating a Web App for your Maps from Scratch using ReactJS and OpenLayers
By: Garrett Holmes
*SA8903 - Fall 2024*

### Requirements
- [NodeJS](https://nodejs.org/en/download/package-manager/current)
- [Git](https://git-scm.com/downloads)
- ReactJS
- OpenLayers
- GDAL ([OsGeo4w](https://gdal.org/en/latest/download.html))
- A text editor (like [VScode](https://code.visualstudio.com/))
    - VScode is built for writing code and has useful plugins and features that streamline the process
    - The rest of this post will assume you are using VScode, but if not the same steps apply only with a different layout in your chosen text editor or terminal.

### Creating a React App
- Follow [this](https://www.geeksforgeeks.org/create-a-new-react-app-npm-create-react-app/) tutorial for a more in-depth look at React.
- The following will summarize the steps needed

#### Install React
After installing NodeJS, you should be able to install packages using the `npm` command.
NodeJS allows us to both install react and create a new project all in one command. 
First, run vscode and open a folder you want to create your project in, (File -> Open Folder). Then, open a new terminal by clicking Terminal -> New Terminal.
In the terminal, run the command `npx create-react-app app_name`. You can replace 'app_name' with any name you want for your project, I will use the name 'map_app' for this project. You will notice on the left in the 'explorer' that a new folder has been created with the name of your app. Navigate to the folder either by clicking File -> Open Folder -> map_app (in file explorer), or in the terminal, type the command `cd map_app`.
You will notice a few important files and folders in here. 'README.md' includs some information and important commands for your app. The 'public' folder includes any files that you'll want to access in your app, like images or metadata. This is where you will put your GIS data once we have the react app assembled. Don't delete anything from here for now. 
The 'src' folder is where we'll be doing most of our work, and has several important files. The only files we will focus on for now are 'App.js', 'App.css', and 'index.css'. For a more in-depth look into these files and folders read through the tutorial I linked at the start, or you can look into [how React Apps work](https://www.geeksforgeeks.org/react/) and how they relate to HTML and CSS.

React designed to be modular and organized, and essentially lets us manipulate HTML components using javascript. A react app is made up of components, which are sections of code that are modular and re-usable. Components also have props and states. Props are passed into a component and can represent things like text, style options, files, and more to change the look and behaviour of components. Hooks are functions that allow us to change the state of a component on the fly, and are what makes react interactive and mutable.

### Setting up OpenLayers

Before we start our react app, lets install OpenLayers, a library that allows us to easily display and work with geographic vector data with javascript and html, which can therefore be used with react.
Run the command `npm install ol` to install OpenLayers.

Now that we have a react app set up and OpenLayers, we can start our react app with `npm start`. This will open a page in your default browser that links to the local server on your machine that's running your application. You should see the default page with a large ReactJS logo and a link to a tutorial. React is set up so that we can make changes while the server is running and see them immediately reflected on the web page. Try going into 'App.js' and changing 'Edit <code>src/App.js</code> and save to reload.' to 'Hello World!'. Hit ctrl+s on your keyboard and you should see you change right away, pretty cool!

### Making a basemap

Now lets make a component for our map. Right click on the 'src' folder in the left pane and click 'New Folder', we will call it 'Components'. Now right click on that folder and click 'New File', call it 'BaseMap.js'. If you have the extension 'ES7+ React/Redux/React-Native snippets' installed - in the extensions tab on the left - you can go to your new file and type 'rfce' then press enter to create the basic shell of a component with the same name as the filename. Otherwise you can copy the code below into your 'MapLayer.js' file:

```
import React from 'react'

function BaseMap() {
  return (
    <div>BaseMap</div>
  )
}
```
export default BaseMap


Now lets populate the component with everything we need from OpenLayers. We will create a map that displays open street map, an open source basemap. I won't explain everything about how react works since it would take too long, but see the [OpenLayers guide])(https://openlayers.org/doc/tutorials/concepts.html) for details on what each of the components are doing. This should be your comonent once you have added everything:

``` 
import React, { useEffect, useState } from 'react'

// Import the necessary components from OpenLayers
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import { OSM } from 'ol/source'

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
        </div>
    )
}

export default BaseMap
```

This will fill the entire page with the Open Street Map basemap.
To render our component on the page, navigate to 'App.js' and delete all the default items inside the `<div>` in the return statement. At the top of the page import our BaseMap component: `import BaseMap from './Components/BaseMap';`. Then, add the component inside the `<div>` in the return statement.

```
function App() {
  return (
    <div className="App">
      <BaseMap/>
    </div>
  );
}
```

Hit ctrl+s to save, and you should see your map on the webpage! You will be able to zoon and navigate the same as if it were google maps.

### Adding vector data to the map

Now, let's create a generalized component that we can use to add vector data to the web app. OpenLayers is capable of supporting a variety of filetypes for displaying vector data, but for now we'll use GeoJSON because of it's widespread compatibility.

Inside the 'Components' folder, create a new file called 'MapLayers.js', then use `rfce` to populate the component, or copy the following code:

```
import React from 'react'

function MapLayers() {
  return (
    <div>MapLayers1</div>
  )
}

export default MapLayers
```

In React, components communicate with eachother using 'props'. We'll use these to add our layers.

Add a 'layers' prop and a 'map' prop to the component definition:

`function MapLayers({ layers, map })`

Now we can access the data that's passed into the component. Layers will represent a list of objects containing the filenames for our data as well as symbology information. Map will be the same map we created in the 'BaseMap' component.

For react to run code, we need to use a function called a `useEffect`, that will run automatically when the props that we specify are changed. Inside this function is where we will load the vector data into the 'map' prop.

```
 // Use effect will make sure that the map is continuously rendered every time it changes
    useEffect(() => {
        // Error checking
        if (!map || !layers || layers.length === 0) return;

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
                zIndex: geojson.zIndex ? geojson.zIndex : 2, // Ternary operator, if the layer has a zIndex use it, otherwise default 2
                style: geojson.style
            })

            vectorLayers.push(vectorLayer);
            map.addLayer(vectorLayer);

        });

        return () => {
            layers.forEach((layer) => map.removeLayer(layer)); // Cleanup on unmount
        };
        
    }, [map, layers]);
```

Since the 'layers' prop is a list of object, we can iterate through it with the 'forEach' command. For every layer in the list, we'll make a new VectorSource, which is an OpenLayers object that keeps track of geometry information. We'll then add each VectorSource to a VectorLayer, which keeps track of how we display the geometry. Finally, the loop adds each new layer to the map. The list at the very bottom of the 'useEffect()' tells the program to run the contained code every time the 'map' or 'layers' props change.

For now, our component will return 'null', because everything is going to be rendered on the map in the BaseMap component.

Here's what your final 'MapLayers' component should look like:

```
import { useEffect } from 'react'

// Import the necessary components from OpenLayers
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON.js';

function MapLayers({ layers, map }) {

    // Use effect will make sure that the map is continuously rendered every time it changes
    useEffect(() => {
        // Error checking
        if (!map || !layers || layers.length === 0) return;

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
                zIndex: geojson.zIndex ? geojson.zIndex : 2, // Ternary operator, if the layer has a zIndex use it, otherwise default 2
                style: geojson.style
            })

            vectorLayers.push(vectorLayer);
            map.addLayer(vectorLayer);

        });

        return () => {
            layers.forEach((layer) => map.removeLayer(layer)); // Cleanup on unmount
        };

    }, [map, layers]);

    return null
}

export default MapLayers
```

### Adding Data

A map with nothing on it is no use to anyone, so let's add some data. For this project, I'm going to build a web tool for looking at how the water level affects the rivers edge in the Madawaska River Provincial Park in Ontario.

The section of river inside the park includes numerous sets of rapids that present a fun and exciting challenge for paddlers. As the water level and discharge rates fluctuate throughout the year from rainfall, snowmelt, and other factors, the conditions of the white water rapids change, so it's important for paddlers to understand what state the river is in in order to prepare for a trip. The goal of my web app will be to visually symbolize what these different water levels mean for paddlers at different times of the year.

In order to represent the elevation of the river and calculate metrics at different locations along the river, we will use the [Ontario Imagery-Derived DEM](https://geohub.lio.gov.on.ca/maps/mnrf::ontario-digital-elevation-model-imagery-derived/explore?location=45.527311%2C-84.732209%2C5.71) which is offered at a 2m resolution. The Madawaska river is located in two sections; DRAPE B, and DRAPE C, download each of these. Since these are very large files image files, we'll need to convert each file to tif format and generate pyramids for display in Arc or QGIS.

Once you've downloaded both datasets, place every .img file into the same folder, then open the OsGeo4w terminal and navigate to the folder.

To convert to TIF format, use [this script](https://gis.stackexchange.com/questions/354605/importing-massive-amounts-of-raster-files), this may take a while.

`for %i in (*.img) do gdal_translate --config GDAL_CACHEMAX 1024 -co NUM_THREADS=ALL_CPUS -co COMPRESS=DEFLATE -co ZLEVEL=9 -co PREDICTOR=2 -co TILED=YES %i %~ni.tif`

Then build a .vrt file for display:

`gdalbuildvrt all.vrt *.tif`

Then, download the [Ontario Hydrographic Line](https://data.ontario.ca/dataset/ontario-hydro-network-hydrographic-line) dataset to get the locations of rapids.

We also need [shape data](https://data.ontario.ca/dataset/aquatic-resource-area-polygon-segment) to represent the river itself. This dataset includes the section of river that we'll be using as it's own item, so there is no need to clip it. Simply load the shapefile into the GIS software of your choice (QGIS in my case), select the geometry where 'OFFICIAL_W' = 'Madawaska River', then extract by selection to get our shapefile.

Next, load the '.vrt' file you made from the DEM images into GIS, and clip it by the extent of the river polygon. I chose to clip the raster to a buffer of 1km to leave room to represent the surrounding area as well. Do the same for the Hydrographic Line data.

### Perparing the data

Now we can begin to create the data that we'll need for our web app.

When the water level of a river rises, the width of the river expands, and the bank recedes up the shore. We will represent the change in water level by adding a dynamic buffer to the river polygon as an approximation of water level rise. It should be noted that this approximation assumes that the water has risen uniformly across the course of the river, which could not be true, however for the purpose of this app we can use that assumption. The actual distance on land that the river expands to at any given section will depend on the slope of the embankment. This is where our DEM comes into play. We will calculate the buffer distance to be applied to the river based on the slope along the river's edge.

Buffer Distance = water level change / tan(Slope)

*Where slope is represented as a percentage*

The tangent of the slope here represents the ratio of the water level rise to the distance it will travel over land.

To keep things simple, and since the slope of the river bank does not vary much over its course, we will use the average slope along the edge of the river as our Slope value. To do this, I used the following QGIS tools:

- Polygon to Lines (Madawaska River)
- Points Along Geometry (Madawaska River Lines, for every 50m)
- Sample Raster Values (Slope)
- Field Calculator: mean("SAMPLE_1") = **9.6%**

Therefore the constant we'll divide the water level change with will be **tan(slope) = 0.17**

Before adding my shape data to the map, I had to do a fair amount of cleaning in QGIS. First, every layer is clipped to be within 1km of the river. All the rapids were named manually based on [topographic maps](https://caltopo.com/map.html#ll=52.61639,-67.36816&z=5&b=t&o=f%2Cr&n=1,0.25&a=sf), then Aggregated by their name. I also generated a file containing the centroids for each set of rapids for easier interpretation on the map.

Campsite and Access Point data was taken from the [Recreation Point](http://geo1.scholarsportal.info.ezproxy.lib.torontomu.ca/#r/details/_uri@=1401640795) dataset by the Ministry of Natural Resources. Campsites and Access points were split into seperate layers for easier symbolization.

Each file was then exported from QGIS as a GeoJSON file, then saved in the 'public' folder of my react app under 'layers'. This will make it possible to access the layers from the code.

### Adding the data to the web app

Now that all the data is ready, we can put all the pieces together. Inside 'BaseMap.js', create a new list at the top of the page called 'jsonLayers'. Each item in the list will have the following format:

```
{
  filename: "layers/layerfilename.geojson",
  style: new Style(),
  zIndex: #
}
```
Where the filename is the path to your GeoJSON layer, the style is an OpenLayers Style instance (which I won't explain here, but you can learn more from the [OpenLayers documentation](https://openlayers.org/en/latest/apidoc/module-ol_style_Style-Style.html)), and zIndex represents which layers will appear on top of others (For example, zIndex = 1 is below zIndex = 10).

Next, at the bottom of the component where we 'return' what to display, we will add an instance of our 'MapLayers' component, and pass in the required props.

```
return (
        // Return a <div> item with style set so that it covers the entire screen
        <div>
            <div id="map" style={{ width: "100vw", height: "100vh" }} />
            {map && (<MapLayers map={map} layers={jsonLayers} />)}
        </div>
    )
```

Now in your web app, you should see your layers on screen! You may need to zoom in to find them.

I added a few other features and tools that make it so that the map automatically zooms to the extent of the largest layer, and so that the user can select features to see their name.

### Geovisualization

Once the basic structure of the app was set up, I could start to add extra features to represent the water level change. I created a new component called 'BufferLayer', which takes in a single GeoJSON file as well as a map to display the vector on. This component makes use of a library called [turf.js](https://turfjs.org/) that allows you to perform geospatial operations in javascript. I used turf.js to apply the buffer described above using a function:

```
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

    // Check if the buffer resulted in a valid polygon
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
```

This function takes the geometry from the VectorSource for the layer, and directly applied a turf.js buffer operation to is. The buffer is always applied to the 'original' river polygon, meaning that a 10m buffer won't 'stack' on top of another 10m buffer. This also prevents issues with broken geometry caused by the buffer operation when applying a negative buffer.

To control my buffer, I created one more component called 'LevelSlider', which adds a simple slider and a button that when pressed, runs the 'handleBufferChange` function. The math for calculating the buffer distance based on the slope is done in the LevelSlider component with the static values I calculated earlier. The minimum and maximum values are also customizable. Here's a snippet of that component:

```
 // Only send the value on button click to prevent performance issues
    const handleButtonClick = () => {
        onChange(Number(sliderValue) / tanSlope); // Send value to parent on button click
    };

    return (
        <div style={{ padding: '10px', textAlign: 'center' }}>
            <label htmlFor="buffer-slider">Water Level (meters): </label>
            <input
                id="buffer-slider"
                type="range"
                min={min}
                max={max}
                step={step}
                value={sliderValue}
                onChange={handleSliderChange}
            />
            <span>{sliderValue}m</span>
            <span>{'\t'}</span>
            <button onClick={handleButtonClick}>Apply Water Level Change</button>
        </div>
    )
```

The LevelSlider component is added in the 'return' section of 'BufferLayer', with CSS styling to make sure it appears neatly in the bottom left corner of the map.

```
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
  }}>
    <LevelSlider min={-0.9} max={3.2} initialValue={-0.9} step={0.1} onChange={handleBufferChange} />
  </div>
)
```

The example minimum and maximum values are based on the minimum and maximum water level changes (from average) in the river based on [real hydrometric data from Environment Canada](https://wateroffice.ec.gc.ca/mainmenu/real_time_data_index_e.html).

With a bit of extra styling, and making use of other OpenLayer features like 'Select', and 'Overlay', I was able to build this functional, portable web app that can be added to any react website with ease. 

However, lots more can be done to improve it! A chart that tracks hydrometric data over time could help give context to the water levels on the river. With a little more math, you could even make use of discharge information to estimate the speed of the river at different times of year. 

Using the campsite data and a centreline of the river course, you could calculate the distance between campsite, rapids, access points, etc. Making the tool a functional for planning trips. Also, given more information about individual whitewater sets, such as classes (C2, C3, etc.), descriptions, or images you could better represent the river in all it's detail.