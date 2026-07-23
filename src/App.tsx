import React, { useState, useEffect, useCallback } from 'react';
import { GeoCity, WeatherData, WeatherUnits } from './types/weather';
import { fetchWeatherData, getCityFromCoordinates, DEFAULT_CITIES } from './services/openMeteo';
import { analyzeWeatherIntelligence, formatTemp } from './utils/intelligenceEngine';
import { Navbar } from './components/Navbar';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { WeatherAlertsBanner } from './components/WeatherAlertsBanner';
import { HourlyCharts } from './components/HourlyCharts';
import { SevenDayForecast } from './components/SevenDayForecast';
import { OutfitPlanner } from './components/OutfitPlanner';
import { ActivityPlanner } from './components/ActivityPlanner';
import { RecentSearches } from './components/RecentSearches';
import { ErrorState } from './components/ErrorState';
import { RefreshCw, CloudRain, Heart, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('wi_dark_mode');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to root HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('wi_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Unit Preferences
  const [units, setUnits] = useState<WeatherUnits>(() => {
    const saved = localStorage.getItem('wi_units');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return { temperature: 'celsius', speed: 'kmh' };
  });

  useEffect(() => {
    localStorage.setItem('wi_units', JSON.stringify(units));
  }, [units]);

  // Recent searches list
  const [recentCities, setRecentCities] = useState<GeoCity[]>(() => {
    const saved = localStorage.getItem('wi_recent_cities');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_CITIES.slice(0, 4);
  });

  useEffect(() => {
    localStorage.setItem('wi_recent_cities', JSON.stringify(recentCities));
  }, [recentCities]);

  // Selected City & Weather Data state
  const [currentCity, setCurrentCity] = useState<GeoCity>(() => recentCities[0] || DEFAULT_CITIES[0]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load weather for selected city
  const loadWeather = useCallback(async (city: GeoCity) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(city);
      setWeatherData(data);

      // Add to recent cities if not already present at index 0
      setRecentCities((prev) => {
        const filtered = prev.filter(
          (c) => !(c.name.toLowerCase() === city.name.toLowerCase() && c.country === city.country)
        );
        return [city, ...filtered].slice(0, 8);
      });
    } catch (err: any) {
      console.error('Failed to load weather:', err);
      setError(err.message || 'Failed to fetch weather data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadWeather(currentCity);
  }, [currentCity, loadWeather]);

  // Unit toggle handlers
  const handleToggleTempUnit = () => {
    setUnits((prev) => ({
      ...prev,
      temperature: prev.temperature === 'celsius' ? 'fahrenheit' : 'celsius',
    }));
  };

  const handleToggleSpeedUnit = () => {
    setUnits((prev) => ({
      ...prev,
      speed: prev.speed === 'kmh' ? 'mph' : prev.speed === 'mph' ? 'ms' : 'kmh',
    }));
  };

  // Select city handler
  const handleSelectCity = useCallback((city: GeoCity) => {
    setCurrentCity(city);
    loadWeather(city);
  }, [loadWeather]);

  // Browser Geolocation GPS Handler
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const detectedCity = await getCityFromCoordinates(latitude, longitude);
          setCurrentCity(detectedCity);
        } catch (err) {
          setError('Could not determine city name from GPS coordinates.');
          setIsLoading(false);
        }
      },
      (geoError) => {
        setIsLoading(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          alert('Location permission was denied. Please select a city using the search bar.');
        } else {
          alert('Could not acquire GPS position. Please try again or search by city name.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Calculate Intelligence recommendations if data loaded
  const intelligence = weatherData
    ? analyzeWeatherIntelligence(
        weatherData.current,
        weatherData.daily.length > 0 ? weatherData.daily[0] : undefined
      )
    : null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans transition-colors duration-300 selection:bg-sky-500 selection:text-white relative overflow-x-hidden">
      
      {/* Immersive Background Ambient Lighting Orbs */}
      <div className="fixed top-[-10%] right-[-10%] w-[550px] h-[550px] bg-sky-600/15 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-[35%] left-[25%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Top Navigation */}
      <div className="relative z-10">
        <Navbar
          currentCity={currentCity}
          onSelectCity={handleSelectCity}
          units={units}
          onToggleTempUnit={handleToggleTempUnit}
          onToggleSpeedUnit={handleToggleSpeedUnit}
          onRefresh={() => loadWeather(currentCity)}
          isLoading={isLoading}
          onUseLocation={handleUseLocation}
          recentCities={recentCities}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
      </div>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Saved Cities Bar */}
        <RecentSearches
          recentCities={recentCities}
          currentCity={currentCity}
          onSelectCity={handleSelectCity}
          onClearRecent={() => setRecentCities([])}
        />

        {/* Loading Spinner */}
        {isLoading && !weatherData && (
          <div className="py-28 text-center space-y-4">
            <div className="inline-flex p-4 rounded-3xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-2xl backdrop-blur-xl">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <p className="text-base font-semibold text-slate-200">
              Gathering satellite & atmospheric data...
            </p>
            <p className="text-xs text-slate-400">Connecting to Open-Meteo Weather API</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <ErrorState
            message={error}
            onRetry={() => loadWeather(currentCity)}
            onSelectCity={handleSelectCity}
          />
        )}

        {/* Main Content Area */}
        {!error && weatherData && intelligence && (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* Active Weather Alerts (if any) */}
            {intelligence.alerts.length > 0 && (
              <WeatherAlertsBanner alerts={intelligence.alerts} />
            )}

            {/* Current Weather Hero Card */}
            <CurrentWeatherCard
              data={weatherData}
              units={units}
              comfortScore={intelligence.comfortScore}
              comfortLabel={intelligence.comfortLabel}
            />

            {/* Smart Outfit Recommendation Module */}
            <OutfitPlanner
              outfits={intelligence.outfits}
              outfitSummary={intelligence.outfitSummary}
              feelsLikeTemp={formatTemp(weatherData.current.apparent_temperature, units.temperature)}
            />

            {/* 24-Hour Forecast & Charts */}
            <HourlyCharts hourly={weatherData.hourly} units={units} />

            {/* Outdoor & Leisure Activity Planner */}
            <ActivityPlanner activities={intelligence.activities} />

            {/* 7-Day Daily Forecast */}
            <SevenDayForecast daily={weatherData.daily} units={units} />

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-16 border-t border-slate-800/80 py-8 text-center text-xs text-slate-400 bg-slate-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-slate-200">Weather Intelligence</span>
            <span>• Powered by Open-Meteo Geocoding & Forecast APIs</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Last Updated: {weatherData?.lastUpdated || 'Just now'}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              No API Keys Required
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
