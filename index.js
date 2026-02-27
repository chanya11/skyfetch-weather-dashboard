// ==========================
// WEATHER APP CONSTRUCTOR
// ==========================

function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

    // DOM References
    this.searchBtn = document.getElementById("search-btn");
    this.cityInput = document.getElementById("city-input");
    this.weatherDisplay = document.getElementById("weather-display");

    this.init();
}


// ==========================
// INITIALIZATION
// ==========================

WeatherApp.prototype.init = function () {
    this.searchBtn.addEventListener(
        "click",
        this.handleSearch.bind(this)
    );

    this.cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            this.handleSearch();
        }
    });

    this.showWelcome();
};


// ==========================
// WELCOME SCREEN
// ==========================

WeatherApp.prototype.showWelcome = function () {
    this.weatherDisplay.innerHTML = `
        <div class="welcome-message">
            <h2>🌤️ SkyFetch Weather Dashboard</h2>
            <p>Enter a city name to get current weather and 5-day forecast.</p>
        </div>
    `;
};


// ==========================
// HANDLE SEARCH
// ==========================

WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError("Please enter a city name.");
        return;
    }

    if (city.length < 2) {
        this.showError("City name must be at least 2 characters.");
        return;
    }

    this.getWeather(city);
    this.cityInput.value = "";
};


// ==========================
// GET WEATHER + FORECAST
// ==========================

WeatherApp.prototype.getWeather = async function (city) {

    this.showLoading();
    this.searchBtn.disabled = true;
    this.searchBtn.textContent = "Searching...";

    const currentUrl =
        `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {

        const [currentWeather, forecastData] = await Promise.all([
            axios.get(currentUrl),
            this.getForecast(city)
        ]);

        this.displayWeather(currentWeather.data);
        this.displayForecast(forecastData);

    } catch (error) {

        console.error("Error:", error);

        if (error.response && error.response.status === 404) {
            this.showError("City not found. Please check spelling.");
        } else {
            this.showError("Something went wrong. Please try again.");
        }

    } finally {
        this.searchBtn.disabled = false;
        this.searchBtn.textContent = "Search";
    }
};


// ==========================
// GET FORECAST DATA
// ==========================

WeatherApp.prototype.getForecast = async function (city) {

    const url =
        `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Forecast Error:", error);
        throw error;
    }
};


// ==========================
// DISPLAY CURRENT WEATHER
// ==========================

WeatherApp.prototype.displayWeather = function (data) {

    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl =
        `https://openweathermap.org/img/wn/${icon}@2x.png`;

    this.weatherDisplay.innerHTML = `
        <div class="weather-info">
            <h2>${cityName}</h2>
            <img src="${iconUrl}" alt="weather icon">
            <h3>${temperature}°C</h3>
            <p>${description}</p>
        </div>
        <div id="forecast-container" class="forecast-container"></div>
    `;
};


// ==========================
// PROCESS FORECAST (5 DAYS)
// ==========================

WeatherApp.prototype.processForecastData = function (forecastData) {

    const dailyForecast = forecastData.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    );

    return dailyForecast.slice(0, 5);
};


// ==========================
// DISPLAY FORECAST CARDS
// ==========================

WeatherApp.prototype.displayForecast = function (forecastData) {

    const processedData = this.processForecastData(forecastData);
    const container = document.getElementById("forecast-container");

    processedData.forEach(day => {

        const date = new Date(day.dt_txt);
        const dayName = date.toLocaleDateString("en-US", {
            weekday: "long"
        });

        const temp = Math.round(day.main.temp);
        const desc = day.weather[0].description;
        const icon = day.weather[0].icon;
        const iconUrl =
            `https://openweathermap.org/img/wn/${icon}@2x.png`;

        container.innerHTML += `
            <div class="forecast-card">
                <h4>${dayName}</h4>
                <img src="${iconUrl}" alt="icon">
                <p>${temp}°C</p>
                <small>${desc}</small>
            </div>
        `;
    });
};


// ==========================
// LOADING STATE
// ==========================

WeatherApp.prototype.showLoading = function () {
    this.weatherDisplay.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>
    `;
};


// ==========================
// ERROR STATE
// ==========================

WeatherApp.prototype.showError = function (message) {
    this.weatherDisplay.innerHTML = `
        <div class="error-message">
            <h3>⚠️ Error</h3>
            <p>${message}</p>
        </div>
    `;
};


// ==========================
// CREATE INSTANCE
// ==========================

const app = new WeatherApp("d1089b1693dc4ebb049726c2b7575343");