import { useState, useEffect } from "react";
import { Sun } from "lucide-react";
import CitySearch from "@/components/CitySearch";
import WeatherGraph from "@/components/WeatherGraph";
import CurrentWeather from "@/components/CurrentWeather";
import { useWeatherData } from "@/hooks/useWeatherData";

const Index = () => {
  const [city, setCity] = useState("Kyiv");
  const { currentWeather, historicalData, isLoading, error, fetchWeatherData } = useWeatherData();

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    fetchWeatherData(selectedCity);
  };

  // Auto-load Kyiv on mount
  useEffect(() => {
    fetchWeatherData(city);
  }, []);

  return (
    <main className="min-h-screen gradient-sky">
      <div className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl gradient-warm shadow-warm">
              <Sun className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Sun<span className="text-primary">Graph</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Visualize sunny days in any city with a GitHub-style activity graph
          </p>
        </header>

        {/* Search and Weather Display */}
        <div className="space-y-6 animate-fade-in bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-xl">
          <CitySearch
            city={city}
            onCityChange={handleCitySelect}
            isLoading={isLoading}
          />

          {error ? (
            <div className="text-destructive text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          ) : (
            <>
              <CurrentWeather
                city={city}
                {...(currentWeather || {})}
              />
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Sunny Days Over the Past Year
                </h2>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Based on cloud coverage data — brighter colors mean sunnier days
                </p>
                <WeatherGraph data={historicalData} isLoading={isLoading} city={city} />
              </div>
            </>
          )}
        </div>

        {/* Footer note */}
        <footer className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            oleksii.lykov@gmail.com
          </p>
        </footer>
      </div>
    </main>
  );
};

export default Index;

