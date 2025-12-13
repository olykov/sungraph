import os
import json
from time import sleep
import requests
from dotenv import load_dotenv

import modules.database as db
from modules.city import City
from modules.weather_data import WeatherData

load_dotenv()
api_key = os.getenv("API_KEY")

def populate_cities():
    cities = load_cities('cities.json')
    for city in cities:
        db.add_city(city.name, city.lat, city.lon)
    print("Cities table populated.")

def get_weather(city: City) -> WeatherData:
    url = f"https://api.openweathermap.org/data/2.5/weather?units=metric&lat={city.lat}&lon={city.lon}&appid={api_key}"
    response = requests.get(url).json()
    # Add city name to response for proper parsing
    response['name'] = city.name 
    return WeatherData.from_api_response(response)

def load_cities(file_path: str) -> list[City]:
    with open(file_path, 'r') as f:
        data = json.load(f)
    return [City(**city) for city in data]

if __name__ == "__main__":
    db.init_db()
    populate_cities()
    cities = load_cities('cities.json')

    while True:
        try:
            for city in cities:
                weather_data = get_weather(city)
                db.save_weather_data(weather_data)
                sleep(300)
            print("Cycle completed, waiting for next run...")
            sleep(60) # Wait a bit before next cycle to avoid rate limits
        except Exception as e:
            print(f"Error: {e}")
            sleep(10)
