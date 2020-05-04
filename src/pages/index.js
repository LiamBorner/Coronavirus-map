import React from 'react';
import Helmet from 'react-helmet';
import L from 'leaflet';
import axios from 'axios';
import Layout from 'components/Layout';
import Map from 'components/Map';


const LOCATION = {
  lat: 50,
  lng: 0
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 3;

const IndexPage = () => {


  async function mapEffect({ leafletElement: map } = {}) {
    let response;

    try {
      response = await axios.get('https://corona.lmao.ninja/v2/countries');
    } catch(e) {
      console.log(`Failed to fetch countries: ${e.message}`, e);
      return;
    }

    const { data = [] } = response; 
    const hasData = Array.isArray(data) && data.length > 0;

    if ( !hasData ) return; 

    const geoJson = {
      type: 'FeatureCollection',
      features: data.map((country = {}) => {
        const { countryInfo = {} } = country;
        const { lat, long: lng} = countryInfo;
        return {
          type: 'Feature',
          properties: {
            ...country,
          },
          geometry: {
            type: 'Point',
            coordinates: [ lng, lat ] 
          }
        }
      })
    }
  

  const geoJsonLayers = new L.GeoJSON(geoJson, {
    pointToLayer: (feature = {}, latlng) => {
      const { properties = {} } = feature;
      let updatedFormatted;
      let casesString;

      const {
        country,
        updated,
        cases,
        deaths,
        recovered,
        todayDeaths
      } = properties

     function percentage(cases, recovered) {
       return recovered/cases*100;
     };

     const recoveryRate = percentage(cases, recovered);

    //  console.log(percentage(cases,recovered));

      casesString = `${cases}`;

      if ( cases > 1000 ) {
        casesString = `${casesString.slice(0, -3)}k+`
      }

      if ( updated ) {
        updatedFormatted = new Date(updated).toLocaleString();
      }

      const html = `
        <span class="icon-marker">
          <span class="icon-marker-tooltip">
            <h2>${country}</h2>
            <ul>
              <li><strong>Confirmed:</strong> ${cases}</li>
              <li><strong>Deaths:</strong> ${deaths}</li>
              <li><strong>Today's deaths:</strong> ${todayDeaths}</li>
              <li><strong>Recovered:</strong> ${recovered}</li>
              <li><strong>Recovery rate:</strong> ${recoveryRate.toFixed(2)}%</li>
              <li><strong>Last update:</strong> ${updatedFormatted}</li>
            </ul>
          </span>
          ${ casesString }
        </span>
      `;

      if ( cases < 1000 ) {
        return null;
      }

      return L.marker( latlng, {
        icon: L.divIcon({
          className: 'icon',
          html
        }),
        riseOnHover: true
      });
    }
  });
  
  geoJsonLayers.addTo(map)
}

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: 'OpenStreetMap',
    zoom: DEFAULT_ZOOM,
    mapEffect
  };


  return (
    <Layout pageName="home">
      <Helmet>
        <title>Home Page</title>
      </Helmet>
      <div class="float-node">        
          <p>Only showing countries with 1000+ cases</p>
        </div>
      <Map {...mapSettings} />
      

      
    </Layout>
  );
};

export default IndexPage;
