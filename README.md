<div align="center">
  <h1>🌦️ SkyCast</h1>
  <p><strong>A beautiful, modern weather application with real-time data, interactive maps, and predictive forecasts.</strong></p>
  
  <p>
    <a href="https://skycastmodern.netlify.app/"><strong>View Live Demo »</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
    <img src="https://img.shields.io/badge/Leaflet.js-199900?style=for-the-badge&logo=Leaflet&logoColor=white" alt="Leaflet.js" />
  </p>
</div>

<br />

## ✨ Features

SkyCast delivers a premium weather tracking experience with a suite of advanced features:

- 🌡️ **Real-Time Weather Data**: Get up-to-the-minute updates on temperature, humidity, wind speed, and atmospheric pressure.
- 📅 **Comprehensive Forecasts**: Plan ahead with detailed 24-hour hourly predictions and 5-day extended forecasts.
- 🗺️ **Interactive Maps**: Seamlessly explore global weather patterns by clicking anywhere on our integrated map.
- 🌬️ **Air Quality Insights**: Stay informed with real-time Air Quality Index (AQI) monitoring.
- 🎤 **Voice-Activated Search**: Effortlessly search for any city globally using hands-free voice commands.
- 📍 **Smart Location Detection**: Instantly load localized weather data using browser geolocation.
- 🌓 **Adaptive Theming**: Choose your preferred viewing experience with seamless light and dark mode toggles.
- 📏 **Flexible Units**: Easily switch between Celsius and Fahrenheit at the click of a button.
- 📶 **Offline Resilience**: Access previously loaded weather data even when your internet connection drops.
- 📱 **Fully Responsive**: Enjoy a perfectly scaled, intuitive interface across all devices (Desktop, Tablet, Mobile).

## 🛠️ Tech Stack

SkyCast is built using standard, modern web technologies:

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **APIs**: [OpenWeatherMap API](https://openweathermap.org/api) (Core Weather Data)
- **Libraries**:
  - [Leaflet.js](https://leafletjs.com/) for interactive global mapping
  - [Chart.js](https://www.chartjs.org/) for clean data visualization
  - [Lottie](https://lottiefiles.com/) for lightweight, smooth weather animations

## 🚀 Quick Setup

To run SkyCast locally and unlock full API functionality, follow these steps:

### 1. Obtain an API Key
1. Navigate to [OpenWeatherMap](https://openweathermap.org/api).
2. Sign up for a free account.
3. Generate and copy your unique API key from your account dashboard.

### 2. Configure the Project
1. Clone this repository and open the project in your preferred code editor.
2. Locate and open the `script.js` file.
3. Find the API key declaration: `const API_KEY = "";`
4. Paste your key inside the quotes:
   ```javascript
   const API_KEY = "your_actual_api_key_here";
   ```

### 3. Launch & Test
1. Open `index.html` in your browser (using Live Server is recommended).
2. Look for the yellow notice banner at the top of the page.
3. Click the **"Test API Key"** button.
4. Upon successful validation, a green checkmark will appear, and the application will fully initialize!

## 🔧 Troubleshooting Support

| Issue | Potential Solution |
| :--- | :--- |
| **API Key Error** | Ensure you copied the entire string without extra spaces. Note that newly generated OpenWeatherMap keys may take up to 2 hours to activate. |
| **Location Blocked** | Check your browser settings to ensure location permissions are granted for this site. Some desktop devices lack GPS hardware. |
| **Missing Weather Data** | Confirm your internet connection is stable. Try searching for a major city (e.g., "London" or "Tokyo") to test data fetching. |

## 🎨 Customization Guide

SkyCast is designed to be highly customizable. Feel free to modify:
- **Themes:** Tweak color variables found at the top of `style.css`.
- **Animations:** Swap out Lottie JSON files in `script.js` to change weather icons.
- **Default State:** Update the fallback coordinates to your preferred home city.

## 📱 Browser Compatibility

Optimized for all modern web browsers:
- ✅ Google Chrome (Recommended)
- ✅ Mozilla Firefox
- ✅ Apple Safari
- ✅ Microsoft Edge

## 📄 License & Contribution

This project is open-source and available under the MIT License. 

Contributions, issues, and feature requests are highly welcome! Feel free to check the issues page or submit a pull request.

---
*Disclaimer: The free tier of the OpenWeatherMap API is subject to rate limiting. For heavy or production-level usage, consider upgrading to a premium API tier.*
