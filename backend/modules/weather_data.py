from dataclasses import dataclass
from typing import Dict, Any, List

@dataclass
class WeatherData:
    city: str
    time: int
    clouds: int
    feels_like: float
    grnd_level: int
    humidity: int
    pressure: int
    sea_level: int
    temp: float
    temp_max: float
    temp_min: float
    visibility: int
    description: str
    wind_deg: int
    wind_speed: float
    wind_gust: float

    @classmethod
    def from_api_response(cls, data: Dict[str, Any]) -> 'WeatherData':
        main = data.get('main', {})
        wind = data.get('wind', {})
        weather_list = data.get('weather', [{}])
        weather_desc = weather_list[0].get('description') if weather_list else None
        
        return cls(
            city=data.get('name'),
            time=data.get('dt'),
            clouds=data.get('clouds', {}).get('all'),
            feels_like=main.get('feels_like'),
            grnd_level=main.get('grnd_level'),
            humidity=main.get('humidity'),
            pressure=main.get('pressure'),
            sea_level=main.get('sea_level'),
            temp=main.get('temp'),
            temp_max=main.get('temp_max'),
            temp_min=main.get('temp_min'),
            visibility=data.get('visibility'),
            description=weather_desc,
            wind_deg=wind.get('deg'),
            wind_speed=wind.get('speed'),
            wind_gust=wind.get('gust')
        )
