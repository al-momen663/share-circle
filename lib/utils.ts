
/**
 * Formats a location string by extracting the display name.
 * Handles the format: "Display Name (lat, lon)"
 */
export const formatLocation = (location: string): string => {
  if (!location) return 'Unknown location';
  
  // If it's in the format "Name (lat, lon)", extract the Name
  const match = location.match(/^(.+?)\s*\(/);
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // If it's just coordinates "lat, lon", return as is or handle
  const coordRegex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
  if (coordRegex.test(location)) {
    return 'Coordinates provided';
  }
  
  return location;
};

/**
 * Parses a location string to extract latitude and longitude coordinates.
 * Handles the format: "Display Name (lat, lon)" or just "lat, lon"
 */
export const parseLatLng = (location: string): [number, number] => {
  if (!location) return [51.505, -0.09];
  
  // Try to match the (lat, lon) pattern at the end of the string
  const parenRegex = /\(([^,]+),\s*([^)]+)\)/;
  const parenMatch = location.match(parenRegex);
  if (parenMatch) {
    const lat = parseFloat(parenMatch[1]);
    const lng = parseFloat(parenMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }
  
  // Try to match just "lat, lon"
  const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
  const coordMatch = location.match(coordRegex);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[3]);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }
  
  return [51.505, -0.09]; // Default coordinates
};
