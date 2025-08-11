# SkyCast - Modern Weather Experience

A beautiful, modern weather application with real-time weather data, forecasts, maps, and more.

## 🚀 Quick Setup

### 1. Get Your API Key
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key from your account dashboard

### 2. Configure the API Key
1. Open `script.js` in your code editor
2. Find this line: `const API_KEY = "";`
3. Replace the empty quotes with your API key:
   ```javascript
   const API_KEY = "your_actual_api_key_here";
   ```

### 3. Test Your Setup
1. Refresh the page
2. Click the "Test API Key" button in the yellow notice
3. If successful, you'll see a green checkmark and the notice will disappear

## ✨ Features

- **Current Weather**: Real-time temperature, humidity, wind, and more
- **5-Day Forecast**: Extended weather predictions
- **Hourly Forecast**: 24-hour detailed forecast
- **Interactive Map**: Click anywhere to get weather for that location
- **Air Quality Index**: Real-time AQI data
- **Voice Search**: Speak to search for cities
- **Location Detection**: Get weather for your current location
- **Dark/Light Theme**: Toggle between themes
- **Unit Conversion**: Switch between Celsius and Fahrenheit
- **Offline Support**: Cached data when offline
- **Responsive Design**: Works on all devices

## 🛠️ How It Works

The application uses:
- **OpenWeatherMap API** for weather data
- **Leaflet.js** for interactive maps
- **Chart.js** for data visualization
- **Lottie** for animated weather icons
- **Local Storage** for caching and preferences

## 🔧 Troubleshooting

### API Key Issues
- Make sure your API key is correctly copied
- Check that you have an active OpenWeatherMap account
- Verify your API key has the necessary permissions

### Location Issues
- Allow location access in your browser
- Check if your device supports geolocation
- Try refreshing the page

### Weather Data Not Loading
- Check your internet connection
- Verify your API key is working
- Try searching for a different city

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🎨 Customization

You can customize:
- Colors and themes in `style.css`
- Weather animations in `script.js`
- Default location coordinates
- Language settings

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Note**: The free OpenWeatherMap API has rate limits. For production use, consider upgrading to a paid plan.
