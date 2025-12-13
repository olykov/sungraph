
import modules.database as db
from typing import List, Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Now unnecessary as frontend proxies, but harmless for internal service
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WeatherRecord(BaseModel):
    id: int
    city: str
    temp: float
    clouds: int
    humidity: int
    wind_speed: float
    description: str
    timestamp: int

class CityResponse(BaseModel):
    name: str
    lat: float
    lon: float

@app.get("/cities", response_model=List[CityResponse])
def get_cities_endpoint():
    return db.get_cities()

class WeatherHistoryItem(BaseModel):
    date: str
    sunny_percent: float

class WeatherResponse(BaseModel):
    current: Optional[WeatherRecord]
    history: List[WeatherHistoryItem]

@app.get("/weather", response_model=WeatherResponse)
def get_weather_history(city: str = None):
    if not city:
        # Just return empty or default behavior if no city specified
        return {"current": None, "history": []}

    # Get latest current weather
    current_record = db.get_latest_weather(city)
    
    # Get daily history
    history_rows = db.get_historical_data(city)
    
    return {
        "current": current_record,
        "history": history_rows
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
