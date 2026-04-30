import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader } from 'lucide-react';

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id?: number;
}

interface LocationSearchProps {
  value: string;
  onChange: (location: { nama: string; latitude: number | null; longitude: number | null }) => void;
  placeholder?: string;
  required?: boolean;
  onNoResultsChange?: (hasNoResults: boolean) => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ 
  value, 
  onChange, 
  placeholder = "Cari lokasi (contoh: Kejaksaan Kabupaten Sampang)",
  required = false,
  onNoResultsChange
}) => {
  const [searchQuery, setSearchQuery] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search location using Nominatim (OpenStreetMap) - free, no API key needed
  const searchLocation = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setResults([]);
      setShowResults(false);
      onNoResultsChange?.(false);
      return;
    }

    setLoading(true);
    try {
      // Using Nominatim API (OpenStreetMap) - free and no API key needed
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=id&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'SILANG-App/1.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setShowResults(data.length > 0);
        onNoResultsChange?.(data.length === 0);
      } else {
        setResults([]);
        setShowResults(false);
        onNoResultsChange?.(true);
      }
    } catch (error) {
      console.error('Error searching location:', error);
      setResults([]);
      setShowResults(false);
      onNoResultsChange?.(true);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchQuery !== value || !selectedLocation) {
        searchLocation(searchQuery);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSelectLocation = (location: LocationResult) => {
    setSelectedLocation(location);
    setSearchQuery(location.display_name);
    setShowResults(false);
    
    onChange({
      nama: location.display_name,
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon)
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setSelectedLocation(null);
    
    // If user clears the input, clear location data
    if (!newValue.trim()) {
      onNoResultsChange?.(false);
      onChange({
        nama: '',
        latitude: null,
        longitude: null
      });
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          className="w-full pl-10 pr-10 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
          autoComplete="off"
        />
        {loading && (
          <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={result.place_id || index}
              type="button"
              onClick={() => handleSelectLocation(result)}
              className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
            >
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {result.display_name.split(',')[0]}
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    {result.display_name}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Show selected location coordinates */}
      {selectedLocation && (
        <div className="mt-2 text-xs text-gray-400 flex items-center space-x-2">
          <MapPin className="w-3 h-3" />
          <span>
            GPS: {parseFloat(selectedLocation.lat).toFixed(6)}, {parseFloat(selectedLocation.lon).toFixed(6)}
          </span>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;


