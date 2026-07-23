export interface GeoCity {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  admin1?: string; // state/region
  admin2?: string;
  country?: string;
  timezone?: string;
  population?: number;
  postcodes?: string[];
}

export type TempUnit = 'celsius' | 'fahrenheit';
export type SpeedUnit = 'kmh' | 'mph' | 'ms';

export interface WeatherUnits {
  temperature: TempUnit;
  speed: SpeedUnit;
}

export interface CurrentWeather {
  temperature: number;
  apparent_temperature: number;
  relative_humidity: number;
  is_day: number;
  precipitation: number;
  weather_code: number;
  cloud_cover: number;
  pressure_msl: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  uv_index: number;
  time: string;
}

export interface HourlyForecastItem {
  time: string;
  formattedTime: string;
  temperature_2m: number;
  apparent_temperature: number;
  precipitation_probability: number;
  weather_code: number;
  wind_speed_10m: number;
  uv_index: number;
  relative_humidity: number;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  weather_code: number;
  temperature_2m_max: number;
  temperature_2m_min: number;
  sunrise: string;
  sunset: string;
  uv_index_max: number;
  precipitation_sum: number;
  precipitation_probability_max: number;
  wind_speed_10m_max: number;
}

export interface WeatherData {
  city: GeoCity;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  timezone: string;
  lastUpdated: string;
}

export interface OutfitItem {
  category: 'top' | 'bottom' | 'outerwear' | 'footwear' | 'accessory';
  label: string;
  iconName: string;
  note?: string;
}

export interface ActivityRecommendation {
  id: string;
  title: string;
  category: 'outdoor' | 'indoor' | 'leisure' | 'sport';
  icon: string;
  status: 'ideal' | 'caution' | 'avoid';
  score: number; // 0 - 100
  reason: string;
  tip: string;
}

export interface WeatherAlert {
  id: string;
  severity: 'info' | 'warning' | 'danger';
  title: string;
  description: string;
  icon: string;
}
