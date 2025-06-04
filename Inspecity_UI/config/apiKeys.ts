import axios from 'axios';

// Google Maps API Keys
export const GOOGLE_MAPS_API_KEYS = [
  "***REMOVED***",
  "***REMOVED***",
  "***REMOVED***",
  "***REMOVED***",
  "***REMOVED***",
  "***REMOVED***",
  "***REMOVED***",
  "***REMOVED***",
  "***REMOVED***",
];

// Keep track of current key index
let currentKeyIndex = 0;

// Function to get current API key
export const getCurrentApiKey = () => {
  return GOOGLE_MAPS_API_KEYS[currentKeyIndex];
};

// Function to rotate to next API key
export const rotateToNextApiKey = () => {
  currentKeyIndex = (currentKeyIndex + 1) % GOOGLE_MAPS_API_KEYS.length;
  console.log(`Rotating to API key ${currentKeyIndex + 1} of ${GOOGLE_MAPS_API_KEYS.length}`);
  return getCurrentApiKey();
};

// Function to make API calls with automatic key rotation
export const makeGoogleMapsApiCall = async (url: string, maxRetries = GOOGLE_MAPS_API_KEYS.length) => {
  let currentKey = getCurrentApiKey();
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      // If the URL already contains maps.gomaps.pro, use it as is
      const finalUrl = url.includes('maps.gomaps.pro') 
        ? url.replace(/key=[^&]+/, `key=${currentKey}`)
        : url
            .replace('maps.googleapis.com', 'maps.gomaps.pro')
            .replace('maps.google.com', 'maps.gomaps.pro')
            .replace(/key=[^&]+/, `key=${currentKey}`);

      console.log('Making API call with URL:', finalUrl);
      const response = await fetch(finalUrl);
      
      if (!response.ok) {
        console.log(`API Key ${currentKeyIndex + 1} HTTP error:`, response.status, response.statusText);
        currentKey = rotateToNextApiKey();
        retryCount++;
        continue;
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.status === "OK") {
        return data;
      } else {
        console.log(`API Key ${currentKeyIndex + 1} error:`, data.status, data.error_message || 'No error message');
        currentKey = rotateToNextApiKey();
        retryCount++;
      }
    } catch (error) {
      console.log(`API Key ${currentKeyIndex + 1} error:`, error instanceof Error ? error.message : 'Unknown error');
      currentKey = rotateToNextApiKey();
      retryCount++;
    }
  }

  throw new Error("All API keys have been exhausted");
}; 

export const fetchNearbyPlaces = async (
  latitude: number,
  longitude: number,
  types: string[]
) => {
  let lastError: Error | null = null;
  
  // Try all keys in order
  for (let i = 0; i < GOOGLE_MAPS_API_KEYS.length; i++) {
    const currentKey = getCurrentApiKey();
    
    try {
      const results = await Promise.all(types.map(type =>
        axios.get('https://maps.gomaps.pro/maps/api/place/nearbysearch/json', {
          params: {
            location: `${latitude},${longitude}`,
            radius: 5000,
            type,
            key: currentKey,
          },
        })
      ));

      // Check if any of the responses had errors
      const hasErrors = results.some(result => 
        result.data.status !== "OK" && result.data.status !== "ZERO_RESULTS"
      );
      
      if (!hasErrors) {
        return results.map(result => result.data);
      }
      
      // If we got here, there were errors in some responses
      lastError = new Error(
        results.map(r => r.data.status + (r.data.error_message ? `: ${r.data.error_message}` : ''))
          .join(' | ')
      );
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
    
    // Rotate to next key for next attempt
    rotateToNextApiKey();
  }

  throw lastError || new Error("All API keys failed for nearby places search");
};


export const FetchPlaceDetails = async (
  placeId: string,
  maxRetries = GOOGLE_MAPS_API_KEYS.length
) => {
  let currentKey = getCurrentApiKey();
  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount < maxRetries) {
    try {
      const url = `https://maps.gomaps.pro/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_phone_number,vicinity&key=${currentKey}`;
      console.log('Fetching place details with URL:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }
      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`API Key ${currentKeyIndex + 1} error:`, lastError.message);
    }

    // Rotate to next key for next attempt
    currentKey = rotateToNextApiKey();
    retryCount++;
  }

  throw lastError || new Error("All API keys have been exhausted for place details");
};


export const fetchNearbySearch = async (
  latitude: number,
  longitude: number,
  keyword: string,
  maxRetries = GOOGLE_MAPS_API_KEYS.length
) => {
  let currentKey = getCurrentApiKey();
  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount < maxRetries) {
    try {
      const url = `https://maps.gomaps.pro/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&keyword=${encodeURIComponent(keyword)}&key=${currentKey}`;
      console.log('Fetching nearby search with URL:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`API Key ${currentKeyIndex + 1} error:`, lastError.message);
    }

    // Rotate to next key for next attempt
    currentKey = rotateToNextApiKey();
    retryCount++;
  }

  throw lastError || new Error("All API keys have been exhausted for nearby search");
};