// API utilized for URL Query
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


// Perform a GET request to the query URL
d3.json(queryURL).then(function(data){
    // Sending data to create Feature function
    createFeature(data.features);
  });
    

function createFeature(earthquakeData, platesData){

    // Placing pop up for each earthquake based on time and place
    function onEachFeature(feature, layer){
        layer.bindPopup(`<h3>Where: ${feature.properties.place}</h3><hr><p>Time: ${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Number of "Felt" Reports: ${feature.properties.felt}`);
    }

    // Creation of a GeoJSON layer
    function createCircleMark(feature, latlng){
       let options = {
        radius:feature.properties.mag*5,
        fillColor: chooseColor(feature.properties.mag),
        color: chooseColor(feature.properties.mag),
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.35
       } 
       return L.circleMarker(latlng,options);
    }
    // Creation of variable for earthquake to include circle marker
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMark
    });

    // Forwarded earthquake layer to the createMap function
    createMap(earthquakes);
}

// Assigning colors to markers to signify size and magnitude of each earthquake
function chooseColor(mag){
    switch(true){
        case(1.0 <= mag && mag <= 2.5):
            return "#0077BC"; // Strong blue
        case (2.5 <= mag && mag <=4.0):
            return "#45BC00";
        case (4.0 <= mag && mag <=5.5):
            return "#A9BC00";
        case (5.5 <= mag && mag <= 8.0):
            return "#BC4500";
        case (8.0 <= mag && mag <=20.0):
            return "#BC0000";
        default:
            return "#E2FFAE";
    }
}

// Creation of map legend
let legend = L.control({position: 'bottomright'});

legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'info legend');
    var grades = [1.0, 2.5, 4.0, 5.5, 8.0];
    var labels = [];
    var legendInfo = "<h4>Magnitude</h4>";

    div.innerHTML = legendInfo

    // For loop to cycle through each magnitude item and assign color to legend
    for (var i = 0; i < grades.length; i++) {
          labels.push('<ul style="background-color:' + chooseColor(grades[i] + 1) + '"> <span>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '' : '+') + '</span></ul>');
        }

      // Adding labels to each list item
      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    
    return div;
  };


// Creation of map
function createMap(earthquakes) {
   // Defining the outdoor and graymap layers
   let streetstylemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "outdoors-v11",
    accessToken: API_KEY
  })

  let graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "light-v10",
    accessToken: API_KEY
  });

  // Define a base object to house the layers
  let baseMaps = {
    "Outdoors": streetstylemap,
    "Grayscale": graymap
  };

  // Creating an overlay object to house the overlay layer
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Creating map and providing earthquake and street maps to display
  let myMap = L.map("map", {
    center: [
      44.6714, -103.8521
    ],
    zoom: 4,
    layers: [streetstylemap, earthquakes]
  });
  // Adding layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  legend.addTo(myMap);
}

