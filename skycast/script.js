/* SkyCast — Modern Weather Experience
   - CHANGE: replace API_KEY below with your OpenWeatherMap API key
   - Uses: current weather, forecast, air pollution (AQI), Leaflet map, Chart.js chart, Lottie animations
   - NEW: Sidebar navigation, modern UI components
*/
const API_KEY = "56607c8a3d4cded401f564a0483b8790"; // TODO: Replace with your OpenWeatherMap API key from https://openweathermap.org/api

/* ---------- DOM Elements ---------- */
// Search & Controls
const searchBtn = document.getElementById("searchBtn");
const locBtn = document.getElementById("locBtn");
const voiceBtn = document.getElementById("voiceBtn");
const cityInput = document.getElementById("cityInput");
const loadingEl = document.getElementById("loading");
const alertBanner = document.getElementById("alertBanner");

// Weather Display
const cityNameEl = document.getElementById("cityName");
const localTimeEl = document.getElementById("localTime");
const tempEl = document.getElementById("temp");
const conditionEl = document.getElementById("condition");
const feelsEl = document.getElementById("feels");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");
const aqiEl = document.getElementById("aqi");
const owIconEl = document.getElementById("owIcon");
const forecastEl = document.getElementById("forecast");
const hourlyEl = document.getElementById("hourly");
const insightEl = document.getElementById("insight");
const lottieContainer = document.getElementById("lottieContainer");
const historyEl = document.getElementById("history");
const shareBtn = document.getElementById("shareBtn");
const saveBtn = document.getElementById("saveBtn");

// Settings
const btnC = document.getElementById("btnC");
const btnF = document.getElementById("btnF");
const langSelect = document.getElementById("langSelect");
const themeToggle = document.getElementById("themeToggle");

// Charts & Map
const feelsCanvas = document.getElementById("feelsChart");

// Navigation
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const navLinks = document.querySelectorAll(".nav-link");
const contentSections = document.querySelectorAll(".content-section");

/* ---------- State ---------- */
let unit = localStorage.getItem("sky_unit") || "metric"; // metric or imperial
let currentLottie = null;
let feelsChart = null;
let map = null;
let mapMarker = null;
let currentTheme = localStorage.getItem("sky_theme") || "light";
let activeFetchController = null; // cancel in-flight requests when a new search starts
const memoryCache = new Map(); // simple in-memory cache for current weather by lat/lon/unit/lang

/* ---------- Initialize UI State ---------- */
function initializeUI() {
  // Check API key and show/hide notice
  const apiKeyNotice = document.getElementById('apiKeyNotice');
  if (apiKeyNotice) {
    if (API_KEY && API_KEY.trim() !== "") {
      apiKeyNotice.style.display = 'none';
    } else {
      apiKeyNotice.style.display = 'flex';
    }
  }
  
  // Unit toggle
  if(unit === "metric") {
    btnC.classList.add("active");
  } else {
    btnF.classList.add("active");
  }
  
  // Theme
  if(currentTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
  
  // Language
  langSelect.value = localStorage.getItem("sky_lang") || "en";
  
  // Navigation
  showSection('current');
  
  // Render history
  renderHistory();
}

/* ---------- Navigation System ---------- */
function showSection(sectionId) {
  // Hide all sections
  contentSections.forEach(section => {
    section.classList.remove("active");
  });
  
  // Remove active class from all nav links
  navLinks.forEach(link => {
    link.classList.remove("active");
  });
  
  // Show target section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add("active");
    
    // Special handling for map section
    if (sectionId === 'map') {
      // Ensure map container is visible and sized properly
      const mapContainer = document.getElementById('map');
      if (mapContainer) {
        // Force a resize event to ensure proper rendering
        setTimeout(() => {
          if (map) {
            map.invalidateSize();
          } else {
            // Initialize map if not already done
            waitForLeaflet(() => initMap());
          }
        }, 100);
      }
    }
  }
  
  // Add active class to corresponding nav link
  const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
  }
}

// Navigation event listeners
navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const sectionId = link.getAttribute("data-section");
    showSection(sectionId);
    
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 1024) {
      sidebar.classList.remove("open");
    }
  });
});

// (Auth removed)
// Sidebar toggle for mobile
sidebarToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

// Close sidebar when clicking outside on mobile
document.addEventListener("click", (e) => {
  if (window.innerWidth <= 1024 && 
      !sidebar.contains(e.target) && 
      !sidebarToggle.contains(e.target)) {
    sidebar.classList.remove("open");
  }
});

/* ---------- Helper Functions ---------- */
function showLoading(show = true) { 
  loadingEl.classList.toggle("hidden", !show); 
}

function showMessage(text = "", ttl = 4000) { 
  alertBanner.textContent = text; 
  alertBanner.classList.remove("hidden"); 
  setTimeout(() => alertBanner.classList.add("hidden"), ttl); 
}

function disableInputs(disabled) {
  [searchBtn, locBtn, voiceBtn, cityInput].forEach(el => {
    if (!el) return;
    el.disabled = !!disabled;
    el.classList.toggle('disabled', !!disabled);
  });
}

function capitalize(s) { 
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; 
}

function formatTemp(val) { 
  return `${Math.round(val)}°${unit === 'metric' ? 'C' : 'F'}`; 
}

function toLocalTime(unixSec, tzSec) { 
  const d = new Date((unixSec*1000) + (tzSec*1000) - (new Date().getTimezoneOffset()*60000)); 
  return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); 
}

function setNightClass(isNight) { 
  document.body.classList.toggle("night", !!isNight); 
}

/* ---------- Persistence: History + Cache ---------- */
function saveLastCity(name) {
  if(!name) return;
  localStorage.setItem("sky_last_city", name);
  let hist = JSON.parse(localStorage.getItem("sky_history") || "[]");
  hist = hist.filter(h => h.toLowerCase() !== name.toLowerCase());
  hist.unshift(name);
  hist = hist.slice(0,5);
  localStorage.setItem("sky_history", JSON.stringify(hist));
  renderHistory();
}

function renderHistory() {
  const hist = JSON.parse(localStorage.getItem("sky_history") || "[]");
  historyEl.innerHTML = "";
  hist.forEach(h => {
    const b = document.createElement("button");
    b.textContent = h;
    b.addEventListener("click", ()=> fetchByCity(h));
    historyEl.appendChild(b);
  });
}

function cacheFullData(obj) { 
  try{ localStorage.setItem("sky_cache", JSON.stringify(obj)); }catch(e){} 
}

function loadCache() { 
  try{ return JSON.parse(localStorage.getItem("sky_cache") || "null"); } catch(e){ return null; } 
}

/* ---------- Unit Toggle ---------- */
function initializeUnitToggles() {
  btnC.addEventListener("click", ()=> {
    if(unit !== 'metric'){ 
      unit = 'metric'; 
      localStorage.setItem("sky_unit", unit); 
      btnC.classList.add("active"); 
      btnF.classList.remove("active"); 
      refreshLast(); 
    }
  });

  btnF.addEventListener("click", ()=> {
    if(unit !== 'imperial'){ 
      unit = 'imperial'; 
      localStorage.setItem("sky_unit", unit); 
      btnF.classList.add("active"); 
      btnC.classList.remove("active"); 
      refreshLast(); 
    }
  });
}

function refreshLast() { 
  const last = localStorage.getItem("sky_last_city"); 
  if(last) fetchByCity(last); 
}

/* ---------- Language & Theme ---------- */
langSelect.addEventListener("change", ()=>{
  localStorage.setItem("sky_lang", langSelect.value); 
  const last = localStorage.getItem("sky_last_city"); 
  if(last) fetchByCity(last); 
});

themeToggle.addEventListener("click", ()=>{
  currentTheme = currentTheme === "light" ? "dark" : "light";
  
  // Immediately update the DOM
  if (currentTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    document.body.classList.add("night");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    document.body.classList.remove("night");
  }
  
  // Save to localStorage
  localStorage.setItem("sky_theme", currentTheme);
  
  // Force a repaint to ensure immediate visual change
  document.body.offsetHeight;
});

/* ---------- Voice Search ---------- */
let recognition = null;
if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = 'en-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  voiceBtn.addEventListener("click", ()=>{
    try{ recognition.start(); }catch(e){}
  });
  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript;
    cityInput.value = text;
    fetchByCity(text);
  };
  recognition.onerror = (e)=> showMessage("Voice error: " + e.error);
} else { voiceBtn.disabled = true; voiceBtn.title = "Voice not supported"; }

/* ---------- events ---------- */
searchBtn.addEventListener("click", ()=> { 
  // Check if API key is set
  if (!API_KEY || API_KEY.trim() === "") {
    showMessage("⚠️ API key not configured. Please add your OpenWeatherMap API key to use this feature.", 8000);
    return;
  }
  
  const city = cityInput.value.trim(); 
  if(city) fetchByCity(city); 
});
cityInput.addEventListener("keydown", (e)=> { if(e.key === "Enter") searchBtn.click(); });
locBtn.addEventListener("click", ()=>{
  // Check if API key is set
  if (!API_KEY || API_KEY.trim() === "") {
    showMessage("⚠️ API key not configured. Please add your OpenWeatherMap API key to use this feature.", 8000);
    return;
  }
  
  if(!navigator.geolocation){
    showMessage("Geolocation not supported by your browser.");
    return;
  }
  
  showLoading(true);
  showMessage("Getting your precise location...");
  
  navigator.geolocation.getCurrentPosition(
    (p) => { 
      const lat = p.coords.latitude;
      const lon = p.coords.longitude;
      const accuracy = p.coords.accuracy;
      
      showMessage(`Location found! Accuracy: ${Math.round(accuracy)}m. Fetching weather...`);
      
      // Get exact location name using reverse geocoding
      getExactLocationName(lat, lon).then(locationName => {
        if (locationName) {
          showMessage(`Weather for ${locationName} (${Math.round(accuracy)}m accuracy)`);
          // Also reflect in the search input
          try { cityInput.value = locationName; } catch(e){}
        }
        fetchByCoords(lat, lon);
      }).catch(() => {
        fetchByCoords(lat, lon);
      });
    }, 
    (err) => {
      showLoading(false);
      let errorMessage = "Location denied or unavailable.";
      
      switch(err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = "Location access denied. Please allow location access in your browser settings.";
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = "Location information unavailable. Please try again.";
          break;
        case err.TIMEOUT:
          errorMessage = "Location request timed out. Please try again.";
          break;
        default:
          errorMessage = "Location error occurred. Please try again.";
      }
      
      showMessage(errorMessage);
      console.error('Geolocation error:', err);
    }, 
    {
      timeout: 20000,
      enableHighAccuracy: true,
      maximumAge: 30000
    }
  );
});

shareBtn.addEventListener("click", async ()=>{ const text = `${cityNameEl.textContent} — ${tempEl.textContent}, ${conditionEl.textContent}. ${insightEl.textContent || ''}`; if(navigator.share){ try { await navigator.share({title: `Weather • ${cityNameEl.textContent}`, text}); } catch(e){ navigator.clipboard.writeText(text); showMessage("Copied to clipboard"); } } else { navigator.clipboard.writeText(text); showMessage("Copied to clipboard"); } });

saveBtn.addEventListener("click", ()=>{ const snapshot = { city: cityNameEl.textContent, temp: tempEl.textContent, condition: conditionEl.textContent, time: new Date().toISOString() }; const snaps = JSON.parse(localStorage.getItem("sky_snaps") || "[]"); snaps.unshift(snapshot); localStorage.setItem("sky_snaps", JSON.stringify(snaps.slice(0,10))); showMessage("Snapshot saved", 2500); });

/* ---------- startup ---------- */
window.addEventListener("DOMContentLoaded", ()=>{
  initializeUI(); // Call the new initializeUI function
  initializeUnitToggles(); // Initialize unit toggle buttons
  const last = localStorage.getItem("sky_last_city");
  if(last){ 
    cityInput.value = last; 
    fetchByCity(last); 
  } else {
    // try geolocate on start with high accuracy
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        (p) => { 
          const lat = p.coords.latitude;
          const lon = p.coords.longitude;
          const accuracy = p.coords.accuracy;
                  fetchByCoords(lat, lon);
      }, 
      (err) => {
        // Startup geolocation failed silently
          // Don't show error message on startup, just silently fail
        }, 
        {
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 60000
        }
      );
    } else {
      // if offline and cached, load cache
      const cached = loadCache();
      if(!navigator.onLine && cached){ 
        useCache(cached); 
        showMessage("Offline: showing last cached data", 4000); 
      }
    }
  }
});

/* ---------- fetch helpers (main flow) ---------- */
async function fetchByCity(city){
  showLoading(true); clearVisuals(); disableInputs(true);
  try{
    // geocode first for more precise sub-city matches
    const lang = langSelect.value || 'en';
    const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`);
    if (!geoRes.ok) throw new Error("City not found");
    const geo = await geoRes.json();
    if (!geo || !geo.length) throw new Error("City not found");
    const { lat, lon, name, state, country } = geo[0];
    const displayName = [name, state, country].filter(Boolean).join(', ');
    cityInput.value = displayName;

    const cacheKey = `current:${lat},${lon}:${unit}:${lang}`;
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      updateCurrent(cached);
      saveLastCity(cached.name);
      const [forecastList, aqi] = await Promise.all([
        fetchForecast(lat, lon),
        fetchAQI(lat, lon)
      ]);
      finalizeCache(cached, forecastList, aqi);
      generateInsight(cached);
      return;
    }

    if (activeFetchController) { try { activeFetchController.abort(); } catch(e){} }
    activeFetchController = new AbortController();
    const curRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}&lang=${lang}`, { signal: activeFetchController.signal });
    if(!curRes.ok) throw new Error("City not found");
    const cur = await curRes.json();

    updateCurrent(cur);
    saveLastCity(cur.name);
    memoryCache.set(cacheKey, cur);

    // forecast + hourly + aqi in parallel
    const [forecastList, aqi] = await Promise.all([
      fetchForecast(cur.coord.lat, cur.coord.lon),
      fetchAQI(cur.coord.lat, cur.coord.lon)
    ]);
    finalizeCache(cur, forecastList, aqi);
    generateInsight(cur);
  } catch(err){
    console.error('Error fetching city weather:', err);
    // fallback: if offline show cache
    if(!navigator.onLine){
      const cached = loadCache();
      if(cached){ useCache(cached); showMessage("Offline: showing cached data",4000); }
      else showMessage("Offline and no cache available");
    } else if (err.name !== 'AbortError') {
      showMessage(err.message || "Could not fetch weather");
    }
  } finally { showLoading(false); disableInputs(false); }
}

async function fetchByCoords(lat, lon, preferredName = null){
  showLoading(true); 
  clearVisuals();
  disableInputs(true);
  
  try{
    const lang = langSelect.value || 'en';
    const cacheKey = `current:${lat},${lon}:${unit}:${lang}`;
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      updateCurrent(cached);
      // choose best display name
      let displayName = preferredName;
      if (!displayName) {
        try { displayName = await getExactLocationName(lat, lon); } catch(e){}
      }
      if (!displayName) {
        displayName = `${cached.name}${cached.sys && cached.sys.country ? ', ' + cached.sys.country : ''}`;
      }
      saveLastCity(displayName);
      const [forecastList, aqi] = await Promise.all([ fetchForecast(lat, lon), fetchAQI(lat, lon) ]);
      finalizeCache(cached, forecastList, aqi);
      generateInsight(cached);
      // center map to coords and show success message
      showMessage(`Weather loaded for ${displayName}!`);
      try { cityInput.value = displayName; } catch(e){}
      initMap(lat, lon, displayName);
      return;
    }

    if (activeFetchController) { try { activeFetchController.abort(); } catch(e){} }
    activeFetchController = new AbortController();
    const curRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}&lang=${lang}`, { signal: activeFetchController.signal });
    if(!curRes.ok) throw new Error("Location weather unavailable");
    const cur = await curRes.json();

    updateCurrent(cur);
    // Decide on the most accurate display name
    let displayName = preferredName;
    if (!displayName) {
      try { displayName = await getExactLocationName(lat, lon); } catch(e){}
    }
    if (!displayName) {
      displayName = `${cur.name}${cur.sys && cur.sys.country ? ', ' + cur.sys.country : ''}`;
    }
    try { cityInput.value = displayName; } catch(e){}
    saveLastCity(displayName);
    memoryCache.set(cacheKey, cur);

    const [forecastList, aqi] = await Promise.all([ fetchForecast(lat, lon), fetchAQI(lat, lon) ]);
    finalizeCache(cur, forecastList, aqi);
    generateInsight(cur);

    // center map to coords and show success message
    showMessage(`Weather loaded for ${displayName}!`);
    initMap(lat, lon, displayName);
  } catch(err){
    console.error('Error fetching weather by coordinates:', err);
    if(!navigator.onLine){
      const cached = loadCache();
      if(cached){ useCache(cached); showMessage("Offline: showing cached data",4000); }
      else showMessage("Offline and no cache");
    } else {
      showMessage(err.message || "Could not fetch weather for this location");
    }
  } finally { 
    showLoading(false); 
    disableInputs(false);
  }
}

/* ---------- forecast + hourly ---------- */
async function fetchForecast(lat, lon){
  try{
    const lang = langSelect.value || 'en';
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}&lang=${lang}`);
    if(!res.ok) throw new Error("Forecast unavailable");
    const data = await res.json();

    // render hourly (approx 24h using available 3h steps)
    renderHourly(data.list.slice(0, 8)); // 8*3 = 24h
    renderForecastGrid(data.list);
    drawFeelsChartFromForecast(data.list); // uses forecast list to draw feels-like for next 24
    return data.list;
  } catch(e){
    showMessage("Forecast error");
    return null;
  }
}

function renderHourly(list){
  hourlyEl.innerHTML = "";
  list.forEach(item => {
    const el = document.createElement("div");
    el.className = "hour-card";
    el.innerHTML = `
      <div style="font-weight:600">${new Date(item.dt*1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
      <img loading="lazy" src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="" style="width:48px">
      <div style="font-weight:600">${Math.round(item.main.temp)}°</div>
      <div style="color:rgba(255,255,255,0.75);font-size:.85rem">${capitalize(item.weather[0].description)}</div>
    `;
    hourlyEl.appendChild(el);
  });
}

function renderForecastGrid(list){
  // pick 5 days (closest to midday)
  const byDate = {};
  list.forEach(item => {
    const date = new Date(item.dt*1000).toDateString();
    if(!byDate[date]) byDate[date] = [];
    byDate[date].push(item);
  });
  const days = Object.keys(byDate).slice(0,5);
  forecastEl.innerHTML = "";
  days.forEach(dateStr=>{
    const items = byDate[dateStr];
    const midday = items.reduce((prev,curr)=>{
      const prevDiff = Math.abs(new Date(prev.dt*1000).getHours() - 12);
      const currDiff = Math.abs(new Date(curr.dt*1000).getHours() - 12);
      return currDiff < prevDiff ? curr : prev;
    }, items[0]);
    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <div style="font-weight:600">${new Date(midday.dt*1000).toLocaleDateString([], {weekday:'short', month:'short', day:'numeric'})}</div>
      <img loading="lazy" src="https://openweathermap.org/img/wn/${midday.weather[0].icon}@2x.png" alt="">
      <div style="margin-top:.4rem;font-weight:600">${Math.round(midday.main.temp)}°</div>
      <div style="color:rgba(255,255,255,0.7);font-size:.9rem">${capitalize(midday.weather[0].description)}</div>
    `;
    forecastEl.appendChild(card);
  });
}

/* ---------- Reverse Geocoding ---------- */
async function getExactLocationName(lat, lon) {
  try {
    const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`);
    if (!res.ok) throw new Error("Reverse geocoding failed");
    
    const data = await res.json();
    if (data && data.length > 0) {
      const location = data[0];
      // Build a more specific location name
      let locationName = location.name;
      
      if (location.state && location.state !== location.name) {
        locationName += `, ${location.state}`;
      }
      if (location.country) {
        locationName += `, ${location.country}`;
      }
      
      return locationName;
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
  }
  return null;
}

/* ---------- AQI ---------- */
async function fetchAQI(lat, lon){
  try{
    const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    if(!res.ok) throw new Error("AQI unavailable");
    const data = await res.json();
    
    const idx = data.list && data.list[0] && data.list[0].main ? data.list[0].main.aqi : null;
    const map = {1: 'Good', 2:'Fair', 3:'Moderate', 4:'Poor', 5:'Very Poor'};
    
    if (idx) {
      aqiEl.textContent = `${idx} • ${map[idx]}`;
      // Also update the dedicated AQI display elements
      const aqiDisplay = document.getElementById('aqiDisplay');
      const aqiDescription = document.getElementById('aqiDescription');
      if (aqiDisplay) aqiDisplay.textContent = `${idx}`;
      if (aqiDescription) aqiDescription.textContent = map[idx];
    } else {
      aqiEl.textContent = '—';
      // Clear dedicated AQI display elements
      const aqiDisplay = document.getElementById('aqiDisplay');
      const aqiDescription = document.getElementById('aqiDescription');
      if (aqiDisplay) aqiDisplay.textContent = '—';
      if (aqiDescription) aqiDescription.textContent = '—';
    }
    
    return data;
  } catch(e){
    console.error('AQI fetch error:', e);
    aqiEl.textContent = '—';
    return null;
  }
}

/* ---------- insights (rule-based alerts) ---------- */
function generateInsight(cur){
  const t = cur.main.temp;
  const feels = cur.main.feels_like;
  const humidity = cur.main.humidity;
  const condition = cur.weather[0].main.toLowerCase();
  const wind = cur.wind.speed;
  const messages = [];

  if(condition.includes("rain") || condition.includes("drizzle")) messages.push("Rain likely — carry an umbrella ☂️.");
  if(condition.includes("snow")) messages.push("Snow conditions — dress warmly ❄️.");
  if(condition.includes("clear") && t >= 25) messages.push("Sunny & warm — sunglasses recommended 😎.");
  if(humidity >= 80 && t >= 25) messages.push("Humid & hot — stay hydrated 💧.");
  if(wind > 10) messages.push("Windy conditions — secure loose items.");
  if(feels - t >= 3) messages.push("Feels warmer than actual temperature.");
  if(t <= 5) messages.push("Very cold — wear heavy layers 🧥.");

  insightEl.textContent = messages.length ? messages[0] : "No special alerts — enjoy your day!";
  if(condition.includes("thunder") || condition.includes("storm") || condition.includes("tornado") || condition.includes("hurricane")){
    showMessage("Severe weather alert: take immediate precautions!", 7000);
  }
}

/* ---------- visuals: Lottie & background effects ---------- */
function applyThemeAndEffects(mainCond, dt, sunriseUnix, sunsetUnix){
  const isNight = dt < sunriseUnix || dt > sunsetUnix;
  setNightClass(isNight);
  
  // Update body class for night mode
  document.body.classList.toggle("night", isNight);
  
  // Add weather-specific body classes for CSS styling
  document.body.className = document.body.className.replace(/weather-\w+/g, '');
  if(mainCond.includes("rain") || mainCond.includes("drizzle") || mainCond.includes("shower")){
    document.body.classList.add("weather-rain");
  } else if(mainCond.includes("snow")){
    document.body.classList.add("weather-snow");
  } else if(mainCond.includes("thunder") || mainCond.includes("storm")){
    document.body.classList.add("weather-storm");
  } else if(mainCond.includes("mist") || mainCond.includes("fog")){
    document.body.classList.add("weather-fog");
  } else if(mainCond.includes("haze") || mainCond.includes("smoke") || mainCond.includes("dust")){
    document.body.classList.add("weather-haze");
  } else if(mainCond.includes("clear")){
    document.body.classList.add(isNight ? "weather-clear-night" : "weather-clear-day");
  }
}

/* Lottie loader mapping (public Lottie URLs). CHANGE if you want other animations. */
function loadLottieForCondition(mainCond, dt, sunrise, sunset){
  clearLottie();
  const mapping = {
    clear_day: "https://assets6.lottiefiles.com/packages/lf20_jz8d0jxn.json",
    clear_night: "https://assets6.lottiefiles.com/packages/lf20_5ngs2ksb.json",
    clouds: "https://assets2.lottiefiles.com/packages/lf20_4bZcFq.json",
    rain: "https://assets2.lottiefiles.com/packages/lf20_jmgekfqg.json",
    snow: "https://assets6.lottiefiles.com/packages/lf20_cu8f3bqf.json",
    thunder: "https://assets4.lottiefiles.com/packages/lf20_2s5nbsjt.json"
  };
  const isNight = dt < sunrise || dt > sunset;
  let key = "clear_day";
  if(mainCond.includes("cloud")) key = "clouds";
  else if(mainCond.includes("rain") || mainCond.includes("drizzle")) key = "rain";
  else if(mainCond.includes("snow")) key = "snow";
  else if(mainCond.includes("thunder") || mainCond.includes("storm")) key = "thunder";
  else if(mainCond.includes("clear") && isNight) key = "clear_night";

  const url = mapping[key];
  if(!url) return;
  try{
    currentLottie = lottie.loadAnimation({ container: lottieContainer, renderer: 'svg', loop: true, autoplay: true, path: url });
  }catch(e){ console.warn("Lottie load failed", e); }
}
function clearLottie(){ if(currentLottie){ try{ currentLottie.destroy(); }catch(e){} currentLottie = null; } lottieContainer.innerHTML = ""; }

/* ---------- update UI ---------- */
function updateCurrent(data){
  // data from OpenWeather current endpoint
  cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
  const tz = data.timezone || 0;
  const local = new Date((data.dt*1000) + (tz*1000) - (new Date().getTimezoneOffset()*60000));
  localTimeEl.textContent = local.toLocaleString([], {weekday:'short', hour:'2-digit', minute:'2-digit', day:'numeric', month:'short'});

  tempEl.textContent = formatTemp(data.main.temp);
  conditionEl.textContent = capitalize(data.weather[0].description);
  feelsEl.textContent = formatTemp(data.main.feels_like);
  humidityEl.textContent = `${data.main.humidity}%`;
  windEl.textContent = `${Math.round(data.wind.speed)} ${unit === 'metric' ? 'm/s' : 'mph'}`;
  sunriseEl.textContent = toLocalTime(data.sys.sunrise, data.timezone);
  sunsetEl.textContent = toLocalTime(data.sys.sunset, data.timezone);

  owIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  owIconEl.alt = data.weather[0].description;

  applyThemeAndEffects(data.weather[0].main.toLowerCase(), data.dt, data.sys.sunrise, data.sys.sunset, data.timezone);
  loadLottieForCondition(data.weather[0].main.toLowerCase(), data.dt, data.sys.sunrise, data.sys.sunset);
}

/* ---------- chart (feels-like) ---------- */
function drawFeelsChartFromForecast(list){
  if(!list || !list.length) return;
  const slice = list.slice(0, 8); // 24 hours approx (3h steps)
  const labels = slice.map(it => new Date(it.dt*1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}));
  const feels = slice.map(it => Math.round(it.main.feels_like));

  if(feelsChart) feelsChart.destroy();
  const ctx = feelsCanvas.getContext("2d");
  feelsChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{ label: `Feels Like (${unit === 'metric' ? '°C' : '°F'})`, data: feels, borderWidth:2, tension:0.35 }]
    },
    options: { responsive:true, plugins:{legend:{display:false}} }
  });
}

/* ---------- map (Leaflet) ---------- */
function isLeafletLoaded() {
  return typeof L !== 'undefined';
}

function waitForLeaflet(callback, maxAttempts = 10) {
  if (isLeafletLoaded()) {
    callback();
    return;
  }
  
  if (maxAttempts <= 0) {
    showMessage('Map library failed to load. Please refresh the page.');
    return;
  }
  
  setTimeout(() => {
    waitForLeaflet(callback, maxAttempts - 1);
  }, 500);
}

function initMap(lat = 20.5937, lon = 78.9629, popupName = "Selected location"){ // default center INDIA
  // Check if Leaflet is loaded
  if (!isLeafletLoaded()) {
    waitForLeaflet(() => initMap(lat, lon));
    return;
  }

  try {
    // if already initialized, just set view & marker
    if(!map){
      map = L.map('map', { zoomControl:true }).setView([lat, lon], 8);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

      // click handler: click map to fetch weather at that point
      map.on('click', async function(e){
        const {lat, lng} = e.latlng;
        try {
          const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${API_KEY}`);
          let displayName = 'Selected location';
          if (res.ok) {
            const data = await res.json();
            if (data && data[0]) {
              const { name, state, country } = data[0];
              displayName = [name, state, country].filter(Boolean).join(', ') || displayName;
              try { cityInput.value = displayName; } catch(e){}
            }
          }
          if (mapMarker) mapMarker.bindPopup(displayName);
          fetchByCoords(lat, lng, displayName);
        } catch(_) {
          fetchByCoords(lat, lng);
        }
      });
    } else {
      map.setView([lat, lon], 8);
    }

    // add or move marker
    if(mapMarker) {
      mapMarker.setLatLng([lat, lon]);
      try { mapMarker.bindPopup(popupName).openPopup(); } catch(e){}
    }
    else {
      mapMarker = L.marker([lat, lon]).addTo(map).bindPopup(popupName).openPopup();
    }
  } catch (error) {
    console.error('Error initializing map:', error);
    showMessage('Error loading map. Please refresh the page.');
  }
}

/* ---------- cache finalize ---------- */
async function finalizeCache(current, forecastList, aqi){
  cacheFullData({current, forecastList, aqi, cachedAt: Date.now()});
}

/* use cache when offline */
function useCache(cache){
  if(!cache) return;
  // populate UI using cached structure
  updateCurrent(cache.current);
  renderHourly(cache.forecastList ? cache.forecastList.slice(0,8) : []);
  renderForecastGrid(cache.forecastList || []);
  if(cache.aqi && cache.aqi.list) {
    const idx = cache.aqi.list[0].main.aqi;
    const map = {1: 'Good', 2:'Fair', 3:'Moderate', 4:'Poor', 5:'Very Poor'};
    aqiEl.textContent = `${idx} • ${map[idx]} (cached)`;
    // Also update dedicated AQI display elements
    const aqiDisplay = document.getElementById('aqiDisplay');
    const aqiDescription = document.getElementById('aqiDescription');
    if (aqiDisplay) aqiDisplay.textContent = `${idx}`;
    if (aqiDescription) aqiDescription.textContent = map[idx];
  }
  // center map if coords available
  if(cache.current && cache.current.coord) initMap(cache.current.coord.lat, cache.current.coord.lon);
}

/* ---------- error handlers (online/offline) ---------- */
window.addEventListener("offline", ()=> showMessage("You are offline — showing cached data if available", 4000));
window.addEventListener("online", ()=> showMessage("Back online", 2000));

/* ---------- clear visuals ---------- */
function clearVisuals(){
  forecastEl.innerHTML = "";
  hourlyEl.innerHTML = "";
  aqiEl.textContent = '—';
  // Clear dedicated AQI display elements
  const aqiDisplay = document.getElementById('aqiDisplay');
  const aqiDescription = document.getElementById('aqiDescription');
  if (aqiDisplay) aqiDisplay.textContent = '—';
  if (aqiDescription) aqiDescription.textContent = '—';
  insightEl.textContent = '';
  owIconEl.src = '';
  clearLottie();
  document.body.className = document.body.className.replace(/weather-\w+/g, '');
  document.body.classList.remove("night");
}

/* ---------- Ensure AQI Display ---------- */
function ensureAQIDisplay() {
  // Check if AQI element exists and is visible
  if (aqiEl && aqiEl.textContent === '—') {
    // AQI element found but no data
  }
}

/* ---------- API Key Validation ---------- */
function validateAPIKey() {
  if (!API_KEY || API_KEY.trim() === "") {
    showMessage("⚠️ No API key found. Please add your OpenWeatherMap API key to script.js", 8000);
    return false;
  }
  
  // Test the API key with a simple request
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=London&appid=${API_KEY}&units=metric`)
    .then(response => {
      if (response.ok) {
        showMessage("✅ API key is working! You can now search for weather data.", 5000);
        // Hide the notice
        const apiKeyNotice = document.getElementById('apiKeyNotice');
        if (apiKeyNotice) {
          apiKeyNotice.style.display = 'none';
        }
      } else {
        showMessage("❌ API key validation failed. Please check your key.", 8000);
      }
    })
    .catch(error => {
      showMessage("❌ API key validation failed. Please check your key and internet connection.", 8000);
    });
}

/* ---------- END of script ---------- */
