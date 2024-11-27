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

Now lets make a component for our map. Right click on the 'src' folder in the left pane and click 'New Folder', we will call it 'Components'. Now right click on that folder and click 'New File', call it 'BaseMap.js'. If you have the extension 'ES7+ React/Redux/React-Native snippets' installed - in the extensions tab on the left - you can go to your new file and type 'rfce' then press enter to create the basic shell of a component with the same name as the filename. Otherwise you can copy the code below into your 'MapLayer.js' file:

```
import React from 'react'

function BaseMap() {
  return (
    <div>BaseMap</div>
  )
}

export default BaseMap
```

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

### Adding Data

A map with nothing on it is no use to anyone, so let's add some data. For this project, I'm going to build a web tool for looking at how the water level affects the rivers edge in the Madawaska River Provincial Park in Ontario.

Environment Canada records [hydrometric information](https://wateroffice.ec.gc.ca/mainmenu/real_time_data_index_e.html) like water level and discharge from stations situated in rivers and lakes across the country. There just so happens to be a station situated right at the top of the Madawaska river where it runs through a Provincial Park, a popular spot for white water paddle sports and camping. The section of river inside the park includes numerous sets of rapids that present a fun and exciting challenge for paddlers. As the water level and discharge rates fluctuate throughout the year from rainfall, snowmelt, and other factors, the conditions of the white water rapids change, so it's important for paddlers to understand what state the river is in in order to prepare for a trip. The goal of my web app will be to visually symbolize what these different water levels mean for paddlers at different times of the year.

To accomplish this we will need a couple of datasets. First, [download](https://wateroffice.ec.gc.ca/download/index_e.html?results_type=historical) the historic hydrometric data from the 'Madawaska River at Palmer Rapids' station in 'Comma Separated Values (CSV)' format. Make sure you download the 'Date-Data' format *without missing days*. The dataset contains water level records from 1930 to the end of 2023. The discharge records only go as far back as 2003.

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

Therefore, tan(slope) = 0.17