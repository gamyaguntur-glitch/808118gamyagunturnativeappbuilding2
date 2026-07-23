import { GeoCity, WeatherData, CurrentWeather, HourlyForecastItem, DailyForecastItem } from '../types/weather';

export const DEFAULT_CITIES: GeoCity[] = [
  {
    id: 1,
    name: 'London',
    latitude: 51.50853,
    longitude: -0.12574,
    country: 'United Kingdom',
    country_code: 'GB',
    admin1: 'England',
    timezone: 'Europe/London',
  },
  {
    id: 2,
    name: 'Tokyo',
    latitude: 35.6895,
    longitude: 139.6917,
    country: 'Japan',
    country_code: 'JP',
    admin1: 'Tokyo',
    timezone: 'Asia/Tokyo',
  },
  {
    id: 3,
    name: 'New York',
    latitude: 40.71427,
    longitude: -74.00597,
    country: 'United States',
    country_code: 'US',
    admin1: 'New York',
    timezone: 'America/New_York',
  },
  {
    id: 4,
    name: 'Paris',
    latitude: 48.85341,
    longitude: 2.3488,
    country: 'France',
    country_code: 'FR',
    admin1: 'Île-de-France',
    timezone: 'Europe/Paris',
  },
  {
    id: 5,
    name: 'Sydney',
    latitude: -33.86785,
    longitude: 151.20732,
    country: 'Australia',
    country_code: 'AU',
    admin1: 'New South Wales',
    timezone: 'Australia/Sydney',
  },
  {
    id: 6,
    name: 'Singapore',
    latitude: 1.28967,
    longitude: 103.85007,
    country: 'Singapore',
    country_code: 'SG',
    admin1: 'Singapore',
    timezone: 'Asia/Singapore',
  },
  {
    id: 7,
    name: 'San Francisco',
    latitude: 37.77493,
    longitude: -122.41942,
    country: 'United States',
    country_code: 'US',
    admin1: 'California',
    timezone: 'America/Los_Angeles',
  },
  {
    id: 8,
    name: 'Dubai',
    latitude: 25.0657,
    longitude: 55.17128,
    country: 'United Arab Emirates',
    country_code: 'AE',
    admin1: 'Dubai',
    timezone: 'Asia/Dubai',
  },
];

/**
 * Searches cities using Open-Meteo Geocoding API
 */
export async function searchCities(query: string): Promise<GeoCity[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=10&language=en&format=json`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Geocoding API responded with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item: any) => ({
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      elevation: item.elevation,
      country_code: item.country_code,
      admin1: item.admin1,
      admin2: item.admin2,
      country: item.country,
      timezone: item.timezone || 'auto',
      population: item.population,
    }));
  } catch (error: any) {
    console.warn('Geocoding search error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Search request timed out. Please check your internet connection.');
    }
    // Fallback search in default list if offline
    return DEFAULT_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(cleanQuery.toLowerCase()) ||
        c.country?.toLowerCase().includes(cleanQuery.toLowerCase())
    );
  }
}

/**
 * Fetches current weather & 7-day forecast using Open-Meteo Forecast API
 */
export async function fetchWeatherData(city: GeoCity): Promise<WeatherData> {
  const { latitude: lat, longitude: lon } = city;

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,uv_index` +
    `&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,uv_index` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max` +
    `&timezone=auto`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo Weather API error (HTTP ${response.status})`);
    }

    const data = await response.json();

    if (!data.current) {
      throw new Error('Invalid response structure received from weather service');
    }

    // Process current weather
    const current: CurrentWeather = {
      temperature: data.current.temperature_2m ?? 20,
      apparent_temperature: data.current.apparent_temperature ?? data.current.temperature_2m ?? 20,
      relative_humidity: data.current.relative_humidity_2m ?? 50,
      is_day: data.current.is_day ?? 1,
      precipitation: data.current.precipitation ?? 0,
      weather_code: data.current.weather_code ?? 0,
      cloud_cover: data.current.cloud_cover ?? 10,
      pressure_msl: data.current.pressure_msl ?? 1013,
      wind_speed_10m: data.current.wind_speed_10m ?? 10,
      wind_direction_10m: data.current.wind_direction_10m ?? 180,
      uv_index: data.current.uv_index ?? 3,
      time: data.current.time || new Date().toISOString(),
    };

    // Process 24-hour forecast
    const hourly: HourlyForecastItem[] = [];
    if (data.hourly && Array.isArray(data.hourly.time)) {
      const times: string[] = data.hourly.time;
      const temps: number[] = data.hourly.temperature_2m || [];
      const appTemps: number[] = data.hourly.apparent_temperature || [];
      const precipProbs: number[] = data.hourly.precipitation_probability || [];
      const wCodes: number[] = data.hourly.weather_code || [];
      const winds: number[] = data.hourly.wind_speed_10m || [];
      const uvs: number[] = data.hourly.uv_index || [];
      const hums: number[] = data.hourly.relative_humidity_2m || [];

      // Find current hour index or start from 0
      const now = new Date();
      let startIndex = 0;
      for (let i = 0; i < times.length; i++) {
        if (new Date(times[i]) >= now) {
          startIndex = Math.max(0, i - 1);
          break;
        }
      }

      // Next 24 hours
      const endIndex = Math.min(times.length, startIndex + 24);
      for (let i = startIndex; i < endIndex; i++) {
        const rawTime = times[i];
        const dateObj = new Date(rawTime);
        const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        hourly.push({
          time: rawTime,
          formattedTime,
          temperature_2m: temps[i] ?? 20,
          apparent_temperature: appTemps[i] ?? temps[i] ?? 20,
          precipitation_probability: precipProbs[i] ?? 0,
          weather_code: wCodes[i] ?? 0,
          wind_speed_10m: winds[i] ?? 0,
          uv_index: uvs[i] ?? 0,
          relative_humidity: hums[i] ?? 50,
        });
      }
    }

    // Process 7-day daily forecast
    const daily: DailyForecastItem[] = [];
    if (data.daily && Array.isArray(data.daily.time)) {
      const dTimes: string[] = data.daily.time;
      const dCodes: number[] = data.daily.weather_code || [];
      const maxTemps: number[] = data.daily.temperature_2m_max || [];
      const minTemps: number[] = data.daily.temperature_2m_min || [];
      const sunrises: string[] = data.daily.sunrise || [];
      const sunsets: string[] = data.daily.sunset || [];
      const maxUvs: number[] = data.daily.uv_index_max || [];
      const precipSums: number[] = data.daily.precipitation_sum || [];
      const precipMaxProbs: number[] = data.daily.precipitation_probability_max || [];
      const windMaxs: number[] = data.daily.wind_speed_10m_max || [];

      const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      for (let i = 0; i < Math.min(7, dTimes.length); i++) {
        const dateObj = new Date(dTimes[i]);
        const dayName = i === 0 ? 'Today' : dayFormatter.format(dateObj);

        daily.push({
          date: dTimes[i],
          dayName,
          weather_code: dCodes[i] ?? 0,
          temperature_2m_max: maxTemps[i] ?? 22,
          temperature_2m_min: minTemps[i] ?? 14,
          sunrise: sunrises[i] ? new Date(sunrises[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:00 AM',
          sunset: sunsets[i] ? new Date(sunsets[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:00 PM',
          uv_index_max: maxUvs[i] ?? 4,
          precipitation_sum: precipSums[i] ?? 0,
          precipitation_probability_max: precipMaxProbs[i] ?? 0,
          wind_speed_10m_max: windMaxs[i] ?? 15,
        });
      }
    }

    const lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return {
      city,
      current,
      hourly,
      daily,
      timezone: data.timezone || city.timezone || 'UTC',
      lastUpdated,
    };
  } catch (error: any) {
    console.error('Failed to fetch weather data:', error);
    throw new Error(
      error.message || 'Unable to load weather details for this location. Please check network connection.'
    );
  }
}

/**
 * Reverse geocoding lookup using Open-Meteo or BigDataCloud free API or nearest city match
 */
export async function getCityFromCoordinates(lat: number, lon: number): Promise<GeoCity> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const cityName = data.city || data.locality || data.principalSubdivision || 'Current Location';
      const countryName = data.countryName || '';
      const countryCode = data.countryCode || '';
      const state = data.principalSubdivision || '';

      return {
        id: Math.round(lat * 1000 + lon * 1000),
        name: cityName,
        latitude: lat,
        longitude: lon,
        country: countryName,
        country_code: countryCode,
        admin1: state,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }
  } catch (err) {
    console.warn('Reverse geocoding error:', err);
  }

  // Fallback to coordinates label
  return {
    id: Math.round(lat * 100 + lon * 100),
    name: `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
    latitude: lat,
    longitude: lon,
    country: 'GPS Position',
    country_code: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}
