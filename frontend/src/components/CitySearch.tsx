import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CitySearchProps {
  city: string;
  onCityChange: (city: string) => void;
  isLoading: boolean;
}

interface City {
  name: string;
  lat: number;
  lon: number;
}

const CitySearch = ({ city, onCityChange, isLoading }: CitySearchProps) => {
  const [cities, setCities] = useState<City[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch("/api/cities");
        if (!response.ok) throw new Error("Failed to fetch cities");
        const data = await response.json();
        setCities(data);
      } catch (error) {
        toast({
          title: "Error fetching cities",
          description: "Could not load city list.",
          variant: "destructive",
        });
      }
    };
    fetchCities();
  }, [toast]);

  return (
    <div className="w-full max-w-md mx-auto">
      <Select value={city} onValueChange={onCityChange} disabled={isLoading}>
        <SelectTrigger className="w-full h-12 bg-card border-border/50 focus:ring-primary">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Select a city" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {cities.map((c) => (
            <SelectItem key={c.name} value={c.name}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CitySearch;
