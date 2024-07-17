// Constants
const API_KEY = '4a184889bd438a265badea965139ad25';
const GEO_BASE_URL = 'http://api.openweathermap.org/geo/1.0/direct';
const WEATHER_BASE_URL = 'http://api.openweathermap.org/data/2.5/weather';

/**
 * Fetch geographic coordinates for the specified city, state, and country.
 *
 * @param {string} city - Name of the city.
 * @param {string} state - State code.
 * @param {string} country - Country code.
 * @returns {Promise<object>} - A promise that resolves to geographic coordinates or error information.
 */
async function getCoordinates(city, state, country) {
    const params = new URLSearchParams({
        q: `${city},${state},${country}`,
        limit: 1,
        appid: API_KEY
    });

    try {
        const response = await fetch(`${GEO_BASE_URL}?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.length === 0) {
            throw new Error('Location not found');
        }
        return data[0];
    } catch (error) {
        return { error: `An error occurred: ${error.message}` };
    }
}

/**
 * Fetch weather data for the specified geographic coordinates.
 *
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 * @returns {Promise<object>} - A promise that resolves to weather data or error information.
 */
async function getWeather(lat, lon) {
    const params = new URLSearchParams({
        lat: lat,
        lon: lon,
        appid: API_KEY,
        units: 'metric' // To get the temperature in Celsius
    });

    try {
        const response = await fetch(`${WEATHER_BASE_URL}?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return parseWeatherData(data);
    } catch (error) {
        return { error: `An error occurred: ${error.message}` };
    }
}

/**
 * Parse the weather data received from the API.
 *
 * @param {object} data - The raw JSON data from the API response.
 * @returns {object} - A dictionary containing parsed weather information.
 */
function parseWeatherData(data) {
    try {
        const city = data.name;
        const country = data.sys.country;
        const temperature = data.main.temp;
        const weatherDescription = data.weather[0].description;
        return {
            city: city,
            country: country,
            temperature: temperature,
            weatherDescription: weatherDescription
        };
    } catch (error) {
        return { error: `Error parsing data: ${error.message}` };
    }
}

// Example usage:
(async () => {
    const [city, state, country] = process.argv.slice(2);
    if (!city || !state || !country) {
        console.error('Please provide city, state, and country code as arguments.');
        process.exit(1);
    }

    const coordinates = await getCoordinates(city, state, country);
    if (coordinates.error) {
        console.error(coordinates.error);
    } else {
        const { lat, lon } = coordinates;
        const weatherInfo = await getWeather(lat, lon);
        if (weatherInfo.error) {
            console.error(weatherInfo.error);
        } else {
            console.log(`City: ${weatherInfo.city}, ${weatherInfo.country}`);
            console.log(`Temperature: ${weatherInfo.temperature}°C`);
            console.log(`Weather: ${weatherInfo.weatherDescription}`);
        }
    }
})();
