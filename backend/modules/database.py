import os
import time
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional, List, Dict, Any
from .weather_data import WeatherData

# Database configuration
DB_HOST = os.getenv("DB_HOST", "db")
DB_NAME = os.getenv("POSTGRES_DB", "weather")
DB_USER = os.getenv("POSTGRES_USER", "user")
DB_PASS = os.getenv("POSTGRES_PASSWORD", "password")

def get_db_connection():
    """Establishes and returns a database connection."""
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )
    return conn

def init_db():
    """Initializes the database tables."""
    # Retry logic for initial connection (in case DB is starting up)
    max_retries = 5
    for i in range(max_retries):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Create tables
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS weather_data (
                    id SERIAL PRIMARY KEY,
                    city TEXT,
                    temp REAL,
                    clouds INTEGER,
                    humidity INTEGER,
                    wind_speed REAL,
                    description TEXT,
                    timestamp INTEGER
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS cities (
                    id SERIAL PRIMARY KEY,
                    name TEXT UNIQUE,
                    lat REAL,
                    lon REAL
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS historical_sunshine (
                    id SERIAL PRIMARY KEY,
                    city TEXT,
                    date TEXT,
                    sunny_percent REAL,
                    UNIQUE(city, date)
                )
            ''')
            
            conn.commit()
            cursor.close()
            conn.close()
            print("Database initialized successfully.")
            return
        except Exception as e:
            print(f"Database connection failed (attempt {i+1}/{max_retries}): {e}")
            time.sleep(2)
            
    raise Exception("Could not connect to database after multiple retries")

# --- City Operations ---

def get_cities() -> List[Dict[str, Any]]:
    """Retrieves all cities."""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT name, lat, lon FROM cities ORDER BY name')
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return [dict(row) for row in rows]

def add_city(name: str, lat: float, lon: float):
    """Adds a new city if it doesn't exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO cities (name, lat, lon)
            VALUES (%s, %s, %s)
            ON CONFLICT (name) DO NOTHING
        ''', (name, lat, lon))
        conn.commit()
    except Exception as e:
        print(f"Error adding city {name}: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

# --- Weather Data Operations ---

def save_weather_data(data: WeatherData):
    """Saves current weather data."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO weather_data (city, temp, clouds, humidity, wind_speed, description, timestamp)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        ''', (data.city, data.temp, data.clouds, data.humidity, data.wind_speed, data.description, data.time))
        conn.commit()
        print(f"Saved weather data for {data.city}")
    except Exception as e:
        print(f"Error saving weather data for {data.city}: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

def get_latest_weather(city: str) -> Optional[Dict[str, Any]]:
    """Retrieves the latest weather record for a city."""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM weather_data WHERE city = %s ORDER BY timestamp DESC LIMIT 1', (city,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return dict(row) if row else None

# --- Historical Data Operations ---

def get_last_historical_date(city_name: str) -> Optional[str]:
    """Gets the date of the last historical record for a city."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT MAX(date) FROM historical_sunshine WHERE city = %s', (city_name,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    return result[0] if result else None

def save_historical_record(city_name: str, date_str: str, sunny_percent: float):
    """Saves a single historical sunshine record."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO historical_sunshine (city, date, sunny_percent)
            VALUES (%s, %s, %s)
            ON CONFLICT (city, date) DO NOTHING
        ''', (city_name, date_str, sunny_percent))
        conn.commit()
    except Exception as e:
        print(f"Error saving historical record for {city_name}: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

def get_historical_data(city: str, limit: int = 365) -> List[Dict[str, Any]]:
    """Retrieves historical sunshine data for a city."""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('''
        SELECT date, sunny_percent
        FROM historical_sunshine 
        WHERE city = %s 
        ORDER BY date DESC
        LIMIT %s
    ''', (city, limit))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return [dict(row) for row in rows]
