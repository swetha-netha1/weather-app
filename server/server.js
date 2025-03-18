// server.js

const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS to allow frontend to communicate with the backend
app.use(cors());
app.use(express.json());

// Function to get the next day's date
const getNextDayDate = (daysAhead) => {
  const today = new Date();
  today.setDate(today.getDate() + daysAhead);
  return today.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Route to fetch weather data
app.get('/weather', async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ message: 'City is required' });
  }

  try {
    console.log(`Received request for weather in city: ${city}`);

    // API call to fetch weather
    const response = await axios.get('https://world-weather-online-api1.p.rapidapi.com/weather.ashx', {
      params: {
        q: city,
        num_of_days: 5,
        tp: 1,
        lang: 'en',
        aqi: 'yes',
        alerts: 'no',
        format: 'json',
      },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': process.env.RAPIDAPI_HOST,
      },
    });

    console.log('Weather API response:', response.data);

    const weatherData = response.data.data;
    const currentCondition = weatherData.current_condition[0] || {};
    const upcomingWeather = weatherData.weather || [];

    // Default values for missing data
    if (!currentCondition.temp_C) currentCondition.temp_C = 25;  // Default temperature
    if (!currentCondition.windspeed_km_h) currentCondition.windspeed_km_h = 10;  // Default wind speed

    // Adjust the dates for the upcoming weather (skip today's weather)
    const adjustedUpcomingWeather = upcomingWeather.slice(0).map((day, index) => {
      // For the first upcoming weather, set to next day's date
      const nextDayDate = getNextDayDate(index + 1);
      day.date = nextDayDate;

      // Default values for wind speed and temperature if missing
      if (!day.hourly[0].temp_C) day.hourly[0].temp_C = 25;
      if (!day.hourly[0].windspeed_km_h) day.hourly[0].windspeed_km_h = 10;

      return day;
    });

    // Send the data back
    res.json({ current_condition: currentCondition, weather: adjustedUpcomingWeather });
  } catch (error) {
    console.error('Error during API request:', error);
    res.status(500).json({ message: 'Error fetching weather data', error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
