import { Sun, Cloud, CloudSun, CloudRain, Thermometer, Wind, Droplets } from "lucide-react";

interface CurrentWeatherProps {
  city: string;
  temp?: number;
  clouds?: number;
  humidity?: number;
  windSpeed?: number;
  description?: string;
}

const getWeatherIcon = (clouds?: number) => {
  if (clouds === undefined) return <Cloud className="w-16 h-16 text-muted-foreground" />;
  if (clouds < 20) return <Sun className="w-16 h-16 text-primary" />;
  if (clouds < 50) return <CloudSun className="w-16 h-16 text-primary" />;
  if (clouds < 80) return <Cloud className="w-16 h-16 text-muted-foreground" />;
  return <CloudRain className="w-16 h-16 text-muted-foreground" />;
};

const CurrentWeather = ({ city, temp, clouds, humidity, windSpeed, description }: CurrentWeatherProps) => {
  const sunshinePercent = clouds !== undefined ? 100 - clouds : "-";
  const displayTemp = temp !== undefined ? Math.round(temp) : "-";
  const displayHumidity = humidity !== undefined ? humidity : "-";
  const displayWind = windSpeed !== undefined ? Math.round(windSpeed) : "-";
  const displayDescription = description || "No Data";

  return (
    <div className="bg-card rounded-xl border border-border/50 p-6 shadow-soft animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Current weather in {city}</h2>
          <p className="text-muted-foreground capitalize mt-1">{displayDescription}</p>
        </div>
        {getWeatherIcon(clouds)}
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Thermometer className="w-4 h-4" />
            Temperature
          </div>
          <div className="text-2xl font-semibold mt-1">{displayTemp}°C</div>
        </div>

        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Sun className="w-4 h-4" />
            Sunshine
          </div>
          <div className="text-2xl font-semibold mt-1 text-primary">{sunshinePercent}%</div>
        </div>

        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Droplets className="w-4 h-4" />
            Humidity
          </div>
          <div className="text-2xl font-semibold mt-1">{displayHumidity}%</div>
        </div>

        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Wind className="w-4 h-4" />
            Wind
          </div>
          <div className="text-2xl font-semibold mt-1">{displayWind} m/s</div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;
