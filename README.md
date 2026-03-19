<!-- HERO SECTION -->
<div align="center">
  <img src="https://images.unsplash.com/photo-1592210454359-9043f067919b?q=80&w=2070&auto=format&fit=crop" alt="SkyCast Hero Banner" width="100%" style="border-radius: 15px;" />
  <br/><br/>
  
  <h1>🌤️ SkyCast Modern Weather Experience</h1>
  <p><strong>Predict the unpredictable with an immersive, real-time meteorological dashboard.</strong></p>
  
  <p>
    <a href="https://skycastmodern.netlify.app/" target="_blank">
      <img src="https://img.shields.io/badge/Live_Demo-Access_Now-0052FF?style=for-the-badge&logo=netlify" alt="Live Demo" />
    </a>
    <a href="#-quick-start">
      <img src="https://img.shields.io/badge/Getting_Started-View_Guide-FF5722?style=for-the-badge&logo=rocket" alt="Getting Started" />
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5" />
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3" />
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript" />
    <img src="https://img.shields.io/badge/Leaflet.js-199900?style=flat-square&logo=Leaflet&logoColor=white" alt="Leaflet.js" />
    <img src="https://img.shields.io/badge/OpenWeather-EB6E4B?style=flat-square&logo=openweathermap&logoColor=white" alt="OpenWeather API" />
  </p>
</div>

---

<details open>
  <summary><b>📖 Table of Contents</b></summary>
  <ol>
    <li><a href="#-the-vision">The Vision</a></li>
    <li><a href="#-core-innovations">Core Innovations</a></li>
    <li><a href="#-technical-ecosystem">Technical Ecosystem</a></li>
    <li><a href="#-quick-start">Quick Start</a></li>
    <li><a href="#-architecture">Architecture</a></li>
    <li><a href="#-troubleshooting">Troubleshooting</a></li>
  </ol>
</details>

---

## 🔭 The Vision
SkyCast goes beyond just showing the temperature—it delivers a **responsive, accessible, and data-rich environmental perspective** straight to your screen. Whether you're a traveler checking international weather patterns, or just seeing if you need an umbrella, SkyCast brings the forecast to life through smooth animations and interactive global maps.

---

## ✨ Core Innovations

Explore what makes SkyCast a premium forecasting tool:

<table>
  <tr>
    <td width="50%">
      <h3>🌍 Global Intel at a Glance</h3>
      <ul>
        <li><strong>Hyper-Local Tracking:</strong> Instantly fetches real-time data via your current geolocation.</li>
        <li><strong>Interactive Cartography:</strong> Click anywhere on the Leaflet.js map to drop a pin and instantly read the weather.</li>
        <li><strong>Voice Navigation:</strong> Lose the keyboard. Tap the mic and simply say a city name.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>📊 Predictive Analytics</h3>
      <ul>
        <li><strong>Micro to Macro:</strong> Switch effortlessly between granular 24-hour breakdowns and broad 5-day outlooks.</li>
        <li><strong>Air Quality Index (AQI):</strong> Breathe easier with real-time pollutant tracking.</li>
        <li><strong>Dynamic Metric Swapping:</strong> Convert seamlessly between Celsius & Fahrenheit.</li>
      </ul>
    </td>
  </tr>
</table>

### 🎨 The UI/UX Experience
> *We believe tools should be beautiful.* 
SkyCast incorporates an intelligent **Light/Dark theme architecture** that adjusts to your environment. Wait out digital storms under offline-support coverage (cached viewing) and engage with weather through buttery-smooth **Lottie animations**.

---

## 🛠️ Technical Ecosystem

| Layer | Tools Utilized | Purpose |
| :--- | :--- | :--- |
| **Frontend Foundation** | `HTML5`, `CSS3`, `Vanilla JS` | Delivering blazing-fast rendering without heavy frameworks. |
| **Data Engine** | `OpenWeatherMap API` | The reliable meteorological backend fueling the platform. |
| **Visualization Mapping** | `Leaflet.js` | Rendering seamless, mobile-friendly interactive maps. |
| **Graphing & Data** | `Chart.js` | Transforming raw numbers into beautiful, clean charts. |
| **Motion Graphics** | `LottieFiles` | Ensuring high frame-rate vector animations. |

---

## 🚀 Quick Start

Get your local weather array running in less than 3 minutes:

### 1. The Credentials
Grab your free key by creating an account at [OpenWeatherMap API](https://openweathermap.org/api). You'll find it under your profile dashboard.

### 2. The Configuration
Clone this repository to your local machine, open your code editor, and hook up the core logic:

```javascript
// script.js (Line Configuration)
// ❌ Before
const API_KEY = "";

// ✅ After
const API_KEY = "x2y3z4_your_actual_key_here";
```

### 3. Ignition
Launch `index.html` via Live Server. A yellow banner will prompt you to **test your API Key connection**. Click the button, wait for the green success checkmark, and watch your dashboard initialize!

---

## 💡 Architecture & Customization

Are you a developer looking to forge your own cloud-tracker?
- **Style It:** Modify the core `:root` variables inside `style.css` to instantly reskin the entire interface.
- **Animate It:** Switch out `.json` Lottie files in `script.js` to bring your own weather icons to life.
- **Localize It:** Adjust the fallback coordinate variables to anchor the default view to your home city.

---

## 🩺 Troubleshooting

<details>
<summary><strong>🚫 "Invalid API Key" Error</strong></summary>
When you generate a new OpenWeatherMap key, it can temporarily take 1 - 2 hours for their servers to activate it. Give it a bit of time!
</details>

<details>
<summary><strong>📍 Geolocation Fails to Load</strong></summary>
Ensure that location permissions on your browser (Chrome/Firefox/Safari) are **Allowed** for your local host or server address.
</details>

<details>
<summary><strong>☁️ Weather Dashboard is Blank</strong></summary>
Check your network connection. If using ad-blockers or privacy extensions (like Brave Shields), ensure they aren't blocking API requests.
</details>

---

<br/>

<div align="center">
  <p>Built with ⚡ & 🌧️ for weather enthusiasts everywhere.</p>
  <p>Released under the <strong>MIT License</strong>. Feel free to fork, adapt, and improve.</p>
</div>
