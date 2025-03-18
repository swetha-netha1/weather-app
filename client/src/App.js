import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [upcomingWeather, setUpcomingWeather] = useState([]);
  const [showUpcomingWeather, setShowUpcomingWeather] = useState(false); // State to control visibility

  const fetchWeather = async () => {
    if (weather || error) {
      setWeather(null);
      setError('');
      setCity('');
      setUpcomingWeather([]);
      setShowUpcomingWeather(false); // Reset upcoming weather visibility
      return;
    }

    if (!city) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`http://localhost:5000/weather?city=${city}`);

      // Log the API response for debugging
      console.log('API Response:', response.data);

      if (response.data.message) {
        setError(response.data.message);
        setLoading(false);
        return;
      }

      setWeather(response.data);

      // Ensure the response contains the required fields
      if (response.data.weather && Array.isArray(response.data.weather)) {
        // Slice to get the next 5 days (starting from index 1 to skip today)
        const nextFiveDays = response.data.weather.slice(1, 6);
        setUpcomingWeather(nextFiveDays);
      } else {
        setError('Invalid weather data format');
      }

      setLoading(false);
    } catch (err) {
      setError('Error fetching weather data');
      setLoading(false);
    }
  };

  const getWindSpeed = (condition) => {
    return condition?.windspeed_km_h ? `${condition.windspeed_km_h} km/h` : '10 km/h';
  };

  const handleUpcomingWeatherClick = () => {
    setShowUpcomingWeather((prev) => !prev); // Toggle the state
  };

  const currentCondition = weather?.current_condition;

  return (
    <div className="App">
      <h1>WEATHERBUDDY</h1>

      <div className="search-container">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
        />
        <button onClick={fetchWeather} disabled={loading}>
          {loading ? 'Loading...' : weather ? 'Search Again' : 'Get Weather'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!weather && !loading && !error && (
        <div className="image-placeholder">
          <img src="/icons/thermometer_2903595.png" alt="Weather Placeholder" />
        </div>
      )}

      {weather && currentCondition && (
        <div className="weather-info">
          <h2>{city}</h2>

          <div className="weather-box">
            <img src="/icons/thermometer.png" alt="Thermometer" />
            <div className="weather-data">
              <h3>Today's Weather</h3>
              <p>Temperature: {currentCondition.temp_C}°C</p>
              <p>Humidity: {currentCondition.humidity}%</p>
              <p>Wind Speed: {getWindSpeed(currentCondition)}</p>
            </div>
            <img src="/icons/cloudy.png" alt="Cloudy" />
          </div>

          <button className="upcoming-weather-button" onClick={handleUpcomingWeatherClick}>
            Upcoming Weather
          </button>

          {showUpcomingWeather && (
            <div className="upcoming-weather">
              {upcomingWeather.map((day, index) => (
                <div key={index} className="upcoming-day">
                  <p>Date: {day.date}</p>
                  <p>Temperature: {day.temp_C || '25'}°C</p>
                  <p>Humidity: {day.humidity || '17'}%</p>
                  <p>Wind Speed: {getWindSpeed(day)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;