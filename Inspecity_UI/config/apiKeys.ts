// Google Maps API Keys
export const GOOGLE_MAPS_API_KEYS = [
  "AlzaSyKapAZteq4AJlkV9U32P-AapJbxy3DGn_K",
  "AlzaSypd9XXNxr7JR-diQ_lyTEmkOagqmjml0Rr",
  "AlzaSy0Ty9_p9p53HvIzcwoKJijwamMNMQZ56DE",
  "AlzaSyqTB97UDUvEnVnWruPtPewB8zpVbapB7oi",
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