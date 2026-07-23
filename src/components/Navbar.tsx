import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  RefreshCw,
  Sun,
  Moon,
  CloudRain,
  Sliders,
  Sparkles,
  History,
  X,
  Compass,
} from 'lucide-react';
import { GeoCity, WeatherUnits } from '../types/weather';
import { searchCities, DEFAULT_CITIES } from '../services/openMeteo';

interface NavbarProps {
  currentCity: GeoCity | null;
  onSelectCity: (city: GeoCity) => void;
  units: WeatherUnits;
  onToggleTempUnit: () => void;
  onToggleSpeedUnit: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  onUseLocation: () => void;
  recentCities: GeoCity[];
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCity,
  onSelectCity,
  units,
  onToggleTempUnit,
  onToggleSpeedUnit,
  onRefresh,
  isLoading,
  onUseLocation,
  recentCities,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoCity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showRecent, setShowRecent] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const searchRef = useRef<HTMLDivElement>(null);

  // Active list displayed in dropdown
  const activeList: GeoCity[] = searchResults.length > 0
    ? searchResults
    : (recentCities.length > 0 ? recentCities : DEFAULT_CITIES.slice(0, 5));

  // Reset selectedIndex when results or query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchResults, query, showRecent]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    const timer = setTimeout(async () => {
      try {
        const results = await searchCities(query);
        setSearchResults(results);
        if (results.length === 0) {
          setSearchError(`No cities found matching "${query}"`);
        }
      } catch (err: any) {
        setSearchError(err.message || 'Error searching city');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowRecent(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: GeoCity) => {
    onSelectCity(city);
    setQuery('');
    setIsOpen(false);
    setShowRecent(false);
    setSelectedIndex(-1);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // If an item is highlighted by arrow keys
    if (selectedIndex >= 0 && activeList[selectedIndex]) {
      handleSelect(activeList[selectedIndex]);
      return;
    }

    // If search results already exist, pick the first one
    if (searchResults.length > 0) {
      handleSelect(searchResults[0]);
      return;
    }

    // If search is still pending, execute immediate search
    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await searchCities(query);
      if (results.length > 0) {
        handleSelect(results[0]);
      } else {
        setSearchError(`No cities found matching "${query}"`);
      }
    } catch (err: any) {
      setSearchError(err.message || 'Error searching city');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (query || showRecent)) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < activeList.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : activeList.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setShowRecent(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/80 transition-colors duration-200 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25">
            <CloudRain className="w-5 h-5 animate-pulse" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-white tracking-tight text-base leading-tight flex items-center gap-1.5">
              Weather Intelligence
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/80">
                PRO
              </span>
            </h1>
            <p className="text-xs text-slate-400">Open-Meteo Precision Forecast</p>
          </div>
        </div>

        {/* Search Bar with Autocomplete */}
        <div className="flex-1 max-w-md relative" ref={searchRef}>
          <form onSubmit={handleFormSubmit} className="relative">
            <button
              type="submit"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-400 transition-colors"
              title="Search location"
            >
              <Search className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search city (e.g. Tokyo, Paris, New York)..."
              className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-slate-900/90 text-white placeholder-slate-400 border border-slate-800 focus:border-sky-500 focus:bg-slate-900 outline-none transition-all duration-200 shadow-inner"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSearchResults([]);
                  setSelectedIndex(-1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowRecent(!showRecent);
                  setIsOpen(true);
                }}
                title="Recent searches"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-sky-400 rounded-lg"
              >
                <History className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {(isOpen && (query || showRecent)) && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden z-50 max-h-80 overflow-y-auto">
              
              {isSearching && (
                <div className="p-4 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                  Searching global location database...
                </div>
              )}

              {!isSearching && searchError && (
                <div className="p-3 text-xs text-rose-400 bg-rose-950/40 border-b border-rose-900/50">
                  {searchError}
                </div>
              )}

              {/* Live Search Results */}
              {!isSearching && searchResults.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Matching Locations (Press Enter to select)
                  </div>
                  {searchResults.map((city, index) => {
                    const isHighlighted = selectedIndex === index;
                    return (
                      <button
                        type="button"
                        key={`${city.id}-${city.latitude}-${city.longitude}-${index}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelect(city);
                        }}
                        onClick={() => handleSelect(city)}
                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors group ${
                          isHighlighted
                            ? 'bg-sky-500/20 text-sky-300 border-l-4 border-sky-400 pl-3'
                            : 'hover:bg-slate-800/80 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className={`w-4 h-4 shrink-0 transition-colors ${isHighlighted ? 'text-sky-400' : 'text-slate-400 group-hover:text-sky-400'}`} />
                          <div>
                            <span className={`font-medium ${isHighlighted ? 'text-sky-300' : 'text-slate-200 group-hover:text-sky-400'}`}>
                              {city.name}
                            </span>
                            <span className="text-xs text-slate-400 ml-1.5">
                              {[city.admin1, city.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        </div>
                        {city.country_code && (
                          <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {city.country_code}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Recent Searches / Default Cities */}
              {!isSearching && searchResults.length === 0 && (
                <div className="py-2">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>{recentCities.length > 0 ? 'Recent Searches' : 'Popular Cities'}</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  {(recentCities.length > 0 ? recentCities : DEFAULT_CITIES.slice(0, 5)).map((city, index) => {
                    const isHighlighted = selectedIndex === index;
                    return (
                      <button
                        type="button"
                        key={`recent-${city.id}-${city.name}-${index}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelect(city);
                        }}
                        onClick={() => handleSelect(city)}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between transition-colors group ${
                          isHighlighted
                            ? 'bg-sky-500/20 text-sky-300 border-l-4 border-sky-400 pl-3'
                            : 'hover:bg-sky-950/40 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Compass className={`w-3.5 h-3.5 ${isHighlighted ? 'text-sky-400' : 'text-slate-400 group-hover:text-sky-400'}`} />
                          <span className={`font-medium ${isHighlighted ? 'text-sky-300' : 'text-slate-300'}`}>
                            {city.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {city.country}
                          </span>
                        </div>
                        <span className={`text-xs text-sky-400 transition-opacity ${isHighlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          Select →
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* GPS Location Button */}
          <button
            onClick={onUseLocation}
            title="Use current GPS location"
            className="p-2 rounded-xl text-slate-300 hover:bg-slate-800/80 transition-colors flex items-center gap-1 text-xs font-medium border border-slate-800/60"
          >
            <MapPin className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline">Nearby</span>
          </button>

          {/* Temperature Unit Toggle */}
          <button
            onClick={onToggleTempUnit}
            title="Toggle °C / °F"
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors border border-slate-700/80"
          >
            °{units.temperature === 'celsius' ? 'C' : 'F'}
          </button>

          {/* Speed Unit Toggle */}
          <button
            onClick={onToggleSpeedUnit}
            title="Toggle Wind Speed Unit"
            className="px-2 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700/80 hidden sm:inline-block"
          >
            {units.speed}
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh weather data"
            className="p-2 rounded-xl text-slate-300 hover:bg-slate-800/80 transition-colors border border-slate-800/60 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl text-amber-400 hover:bg-slate-800/80 transition-colors border border-slate-800/60"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>

      </div>
    </header>
  );
};
