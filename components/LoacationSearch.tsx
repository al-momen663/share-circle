
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ value, onChange, placeholder, label }) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocation = async (text: string) => {
    if (text.length < 3) {
      setResults([]);
      return;
    }

    // Check if it's already a coordinate
    const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const match = text.match(coordRegex);
    if (match) {
      setResults([{
        display_name: text,
        lat: match[1],
        lon: match[3]
      }]);
      setShowResults(true);
      return;
    }

    setLoading(true);
    try {
      // Try Nominatim first
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5`,
        {
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors'
        }
      );
      
      if (!response.ok) throw new Error('Nominatim error');
      
      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Nominatim failed, trying fallback:', error);
      try {
        // Fallback to geocode.maps.co (which is often more lenient with CORS/usage)
        const fallbackResponse = await fetch(
          `https://geocode.maps.co/search?q=${encodeURIComponent(text)}`
        );
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          setResults(fallbackData.slice(0, 5));
          setShowResults(true);
        }
      } catch (fallbackError) {
        console.error('Fallback geocoding also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchLocation(val);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handleSelect = (result: any) => {
    const displayValue = result.display_name;
    setQuery(displayValue);
    onChange(displayValue);
    setShowResults(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 3 && setShowResults(true)}
          placeholder={placeholder || "Search for a location..."}
          className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </div>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-start space-x-3 transition border-b border-gray-50 dark:border-gray-700 last:border-none"
            >
              <MapPin className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {result.display_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
