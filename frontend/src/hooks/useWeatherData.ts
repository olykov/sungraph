import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import type { DayData } from "@/components/WeatherGraph";

interface CurrentWeather {
  temp: number;
  clouds: number;
  humidity: number;
  windSpeed: number;
  description: string;
}

interface WeatherState {
  currentWeather: CurrentWeather | null;
  historicalData: DayData[];
  isLoading: boolean;
  error: string | null;
}

const sunshineToSunnyLevel = (sunshine: number): number => {
  // Convert sunshine percentage to sunny level (direct relationship)
  // 100% sunshine = level 5 (very sunny)
  // 0% sunshine = level 0 (overcast)
  if (sunshine > 90) return 5;
  if (sunshine > 75) return 4;
  if (sunshine > 50) return 3;
  if (sunshine > 25) return 2;
  if (sunshine > 10) return 1;
  return 0;
};



export const useWeatherData = () => {
  const [state, setState] = useState<WeatherState>({
    currentWeather: null,
    historicalData: [],
    isLoading: false,
    error: null,
  });

  const fetchWeatherData = useCallback(async (city: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch data from our local backend (via proxy)
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);

      if (!response.ok) {
        throw new Error("Failed to fetch weather data from backend");
      }

      const data = await response.json();

      let currentWeather: CurrentWeather | null = null;
      if (data.current) {
        const latest = data.current;
        currentWeather = {
          temp: latest.temp,
          clouds: latest.clouds,
          humidity: latest.humidity,
          windSpeed: latest.wind_speed,
          description: latest.description,
        };
      } else {
        currentWeather = null;
      }

      // Map historical data
      const historicalData = data.history.map((record: any) => ({
        date: new Date(record.date),
        // record.sunny_percent is 0-100 where 100 is fully sunny.
        // We now pass it directly.
        sunnyLevel: sunshineToSunnyLevel(record.sunny_percent),
        sunshine: record.sunny_percent,
      }));

      setState({
        currentWeather,
        historicalData,
        isLoading: false,
        error: null,
      });


    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, []);

  return {
    ...state,
    fetchWeatherData,
  };
};
