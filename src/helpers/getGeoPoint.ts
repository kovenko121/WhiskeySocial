export const getGeoPoint = async (address: string) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );
  const data = await response.json();

  const { lat, lng: lon } = data.results[0].geometry.location;

  return {
    lat,
    lon,
  };
};
