
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
