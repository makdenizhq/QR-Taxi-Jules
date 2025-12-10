import axios from 'axios';

// Use OSRM Public Demo Server (Note: Use sparingly or set up own instance for prod)
const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

export const getRoute = async (startLat, startLng, endLat, endLng) => {
  try {
    const url = `${OSRM_BASE_URL}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const response = await axios.get(url);
    
    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        coordinates: route.geometry.coordinates.map(coord => [coord[1], coord[0]]), // Convert [lon, lat] to [lat, lon] for Leaflet
        duration: route.duration, // seconds
        distance: route.distance // meters
      };
    }
    return null;
  } catch (error) {
    console.error("Routing error:", error);
    return null;
  }
};
