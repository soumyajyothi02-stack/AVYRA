import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  ArrowLeft,
  ExternalLink,
  Search,
  RefreshCw,
  Coffee,
  Pill,
  Trees,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { ScreenType, GroundedPlace } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface MapsExplorerScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const MapsExplorerScreen: React.FC<MapsExplorerScreenProps> = ({ onNavigate }) => {
  const { languageObj, openLanguageModal, t } = useLanguage();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('San Francisco Bay Area');
  const [searchQuery, setSearchQuery] = useState('');
  const [groundedText, setGroundedText] = useState<string>('');
  const [places, setPlaces] = useState<GroundedPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [routeCurvatureScore, setRouteCurvatureScore] = useState<'low' | 'moderate' | 'high'>('low');

  // Request browser geolocation on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLocationName(`GPS Coordinates (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`);
        },
        _err => {
          // Default fallback
          setUserLocation({ lat: 37.7749, lng: -122.4194 });
        },
        { timeout: 8000 }
      );
    } else {
      setUserLocation({ lat: 37.7749, lng: -122.4194 });
    }
  }, []);

  const handleSearchGrounding = async (customPrompt?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    const lat = userLocation?.lat || 37.7749;
    const lng = userLocation?.lng || -122.4194;

    const query =
      customPrompt ||
      searchQuery ||
      'Find nearby calm rest stops with scenic overlooks, parks for fresh air, and pharmacies for motion sickness relief.';

    try {
      const res = await fetch('/api/gemini/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, latitude: lat, longitude: lng, language: languageObj.name }),
      });

      if (!res.ok) throw new Error('Maps Grounding request failed');
      const data = await res.json();
      setGroundedText(data.text || 'Showing nearby comfort points.');
      setPlaces(data.places || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Maps Grounding error:', msg);
      setErrorMsg('Could not fetch live map points. Showing standard travel wellness waypoints.');
      setGroundedText(
        'Recommended Motion Sickness Rest Areas: Stop at scenic pullouts with an unobstructed view of the horizon. Walk on flat ground for 5 minutes to steady your balance and rest your eyes.'
      );
      setPlaces([
        {
          title: 'Scenic Vista Point & Rest Area',
          uri: 'https://maps.google.com/?q=rest+area+vista+point',
        },
        {
          title: 'Walgreens Pharmacy (Motion Relief & Ginger)',
          uri: 'https://maps.google.com/?q=pharmacy',
        },
        {
          title: 'CVS Health Care & Travel Wellness',
          uri: 'https://maps.google.com/?q=CVS+pharmacy',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearchGrounding();
  }, [userLocation]);

  return (
    <div className="flex-1 flex flex-col bg-[#F3F4EF] dark:bg-[#1E2521] min-h-[calc(100vh-3.5rem)] text-[#252C28] dark:text-[#E4EBE2]">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#252C28] border-b border-[#D8DCD5] dark:border-[#34483B] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#68746B] dark:text-[#9EACA1] hover:bg-[#E4EBE2] dark:hover:bg-[#34483B] transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-[#34483B] text-white flex items-center justify-center">
            <Compass className="w-5 h-5 text-[#91A995]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-[#252C28] dark:text-white font-heading">
                Route & Rest Navigator
              </h2>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#91A995]">
                Google Maps Grounding
              </span>
            </div>
            <p className="text-[11px] text-[#68746B] dark:text-[#9EACA1]">
              Low-Curvature Routes & Calming Stops
            </p>
          </div>
        </div>

        <button
          onClick={() => handleSearchGrounding()}
          className="p-2 rounded-lg bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-white hover:opacity-90 transition-all cursor-pointer"
          title="Refresh Grounded Search"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Curvature & Location Card */}
        <div className="bg-white dark:bg-[#252C28] rounded-2xl border border-[#D8DCD5] dark:border-[#34483B] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#557B61]" />
              <span className="text-xs font-bold text-[#252C28] dark:text-white font-heading">
                {locationName}
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                routeCurvatureScore === 'low'
                  ? 'bg-[#EFF5F0] text-[#557B61]'
                  : routeCurvatureScore === 'moderate'
                  ? 'bg-[#FCF7ED] text-[#C28B45]'
                  : 'bg-[#FBF0EE] text-[#B65D5D]'
              }`}
            >
              Curvature Rating: {routeCurvatureScore.toUpperCase()}
            </span>
          </div>

          {/* Quick Categories */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            <button
              onClick={() => handleSearchGrounding('Find scenic vista overlooks and calm rest areas for fresh air')}
              className="p-2.5 rounded-xl bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#D8DCD5] dark:border-[#34483B] hover:border-[#91A995] flex flex-col items-center gap-1 transition-all cursor-pointer text-center"
            >
              <Trees className="w-4 h-4 text-[#557B61]" />
              <span className="text-[11px] font-semibold text-[#252C28] dark:text-[#E4EBE2]">Scenic Stops</span>
              <span className="text-[9px] text-[#68746B] dark:text-[#9EACA1]">Fresh Air & Views</span>
            </button>

            <button
              onClick={() => handleSearchGrounding('Find 24-hour pharmacies selling travel sickness remedies')}
              className="p-2.5 rounded-xl bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#D8DCD5] dark:border-[#34483B] hover:border-[#91A995] flex flex-col items-center gap-1 transition-all cursor-pointer text-center"
            >
              <Pill className="w-4 h-4 text-[#B65D5D]" />
              <span className="text-[11px] font-semibold text-[#252C28] dark:text-[#E4EBE2]">Pharmacies</span>
              <span className="text-[9px] text-[#68746B] dark:text-[#9EACA1]">Acupressure & Meds</span>
            </button>

            <button
              onClick={() => handleSearchGrounding('Find quiet roadside rest stops with shade and benches')}
              className="p-2.5 rounded-xl bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#D8DCD5] dark:border-[#34483B] hover:border-[#91A995] flex flex-col items-center gap-1 transition-all cursor-pointer text-center"
            >
              <Coffee className="w-4 h-4 text-[#C28B45]" />
              <span className="text-[11px] font-semibold text-[#252C28] dark:text-[#E4EBE2]">Quiet Rest</span>
              <span className="text-[9px] text-[#68746B] dark:text-[#9EACA1]">Safe Pulloffs</span>
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSearchGrounding();
          }}
          className="flex items-center gap-2"
        >
          <div className="flex-1 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#68746B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search specific road, rest area, or town..."
              className="w-full bg-white dark:bg-[#252C28] border border-[#D8DCD5] dark:border-[#34483B] rounded-xl pl-8 pr-3 py-2 text-xs text-[#252C28] dark:text-[#E4EBE2] focus:outline-hidden focus:border-[#91A995]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-[#34483B] text-white text-xs font-semibold hover:bg-[#252C28] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Search
          </button>
        </form>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#FBF0EE] text-[#B65D5D] text-xs">
            {errorMsg}
          </div>
        )}

        {/* Grounded AI Analysis */}
        {groundedText && (
          <div className="bg-white dark:bg-[#252C28] rounded-2xl border border-[#D8DCD5] dark:border-[#34483B] p-4">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-[#34483B] dark:text-[#91A995] uppercase tracking-wider font-heading">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grounded Travel Recommendations</span>
            </div>
            <div className="text-xs leading-relaxed text-[#252C28] dark:text-[#E4EBE2] whitespace-pre-line">
              {groundedText}
            </div>
          </div>
        )}

        {/* Grounded Places List */}
        {places.length > 0 && (
          <div className="bg-white dark:bg-[#252C28] rounded-2xl border border-[#D8DCD5] dark:border-[#34483B] p-4">
            <h3 className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider mb-3 font-heading">
              Grounded Google Maps Places
            </h3>
            <div className="space-y-2">
              {places.map((place, idx) => (
                <a
                  key={idx}
                  href={place.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#D8DCD5] dark:border-[#34483B] hover:border-[#91A995] flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#E4EBE2] flex items-center justify-center shrink-0">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#252C28] dark:text-white group-hover:text-[#34483B] dark:group-hover:text-[#91A995]">
                        {place.title || 'Recommended Rest Point'}
                      </h4>
                      <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1]">
                        Tap to navigate in Google Maps
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#68746B] group-hover:text-[#34483B]" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
