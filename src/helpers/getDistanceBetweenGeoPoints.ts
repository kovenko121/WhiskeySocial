function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate the distance between two geo points in kilometers
 */
export const getDistanceBetweenGeoPointsKm = (
  coord1: {
    lat: number;
    lon: number;
  },
  coord2: {
    lat: number;
    lon: number;
  }
): number => {
  const earthRadiusKm = 6371;

  const dLat = degToRad(coord2.lat - coord1.lat);
  const dLon = degToRad(coord2.lon - coord1.lon);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(coord1.lat)) *
      Math.cos(degToRad(coord2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = earthRadiusKm * c;

  return distanceKm;
};

/**
 * Calculate the distance between two geo points and return as formatted string in miles
 */
export const getDistanceBetweenGeoPoints = (
  coord1: {
    lat: number;
    lon: number;
  },
  coord2: {
    lat: number;
    lon: number;
  }
) => {
  const distanceKm = getDistanceBetweenGeoPointsKm(coord1, coord2);
  const miles = distanceKm * 0.621371;

  return `${miles.toFixed(2)} mi`;
};
