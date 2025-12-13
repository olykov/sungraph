import os
import json
import requests
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv

import modules.database as db
from modules.city import City

load_dotenv()

def load_cities(file_path: str) -> list[City]:
    with open(file_path, 'r') as f:
        data = json.load(f)
    return [City(**city) for city in data]

def fetch_historical_data(lat, lon, start_date, end_date):
    url = f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&start_date={start_date}&end_date={end_date}&daily=cloud_cover_mean&timezone=auto"
    print(f"Fetching: {url}")
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching data: {e}")
        return None

def save_historical_data(city_name, data):
    if not data or 'daily' not in data:
        return

    daily = data['daily']
    times = daily.get('time', [])
    cloud_covers = daily.get('cloud_cover_mean', [])

    count = 0
    for date_str, cloud_cover in zip(times, cloud_covers):
        if cloud_cover is None:
            continue
        
        sunny_percent = 100 - cloud_cover
        db.save_historical_record(city_name, date_str, sunny_percent)
        count += 1

    print(f"Saved {count} records for {city_name}")

def main():
    db.init_db()
    cities = load_cities('cities.json')
    
    # Process loop
    while True:
        print("Starting historical data update cycle...")
        today = datetime.now().strftime('%Y-%m-%d')
        
        for city in cities:
            last_date = db.get_last_historical_date(city.name)
            
            start_date = "2024-01-01"
            if last_date:
                last_date_dt = datetime.strptime(last_date, '%Y-%m-%d')
                start_date_dt = last_date_dt + timedelta(days=1)
                start_date = start_date_dt.strftime('%Y-%m-%d')
            
            # If start_date is in the future relative to today, skip
            if start_date > today:
                print(f"Data for {city.name} is up to date.")
                continue
                
            print(f"Updating {city.name} from {start_date} to {today}")
            
            data = fetch_historical_data(city.lat, city.lon, start_date, today)
            save_historical_data(city.name, data)
            
            time.sleep(1) # Be nice to API

        print("Cycle completed. Sleeping for 6 hours...")
        time.sleep(21600) # 6 hours

if __name__ == "__main__":
    main()
