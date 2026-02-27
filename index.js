function WeatherApp() {
    this.apiKey = "d1089b1693dc4ebb049726c2b7575343";

    this.cityInput = document.getElementById("cityInput");
    this.searchBtn = document.getElementById("searchBtn");
    this.weatherDisplay = document.getElementById("weatherDisplay");
    this.forecastContainer = document.getElementById("forecastContainer");
    this.recentContainer = document.getElementById("recentSearches");
    this.clearBtn = document.getElementById("clearHistoryBtn");

    this.recentSearches = [];

    this.init();
}

WeatherApp.prototype.init = function () {
    this.searchBtn.addEventListener("click", this.handleSearch.bind(this));
    this.clearBtn.addEventListener("click", this.clearHistory.bind(this));

    this.loadRecentSearches();
    this.loadLastCity();
};

WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();
    if (city) {
        this.getWeather(city);
    }
};

WeatherApp.prototype.getWeather = async function (city) {
    try {
        const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`;
        const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.apiKey}&units=metric`;

        const [weatherRes, forecastRes] = await Promise.all([
            fetch(weatherURL),
            fetch(forecastURL)
        ]);

        const weatherData = await weatherRes.json();
        const forecastData = await forecastRes.json();

        if (weatherData.cod !== 200) {
            alert("City not found!");
            return;
        }

        this.displayWeather(weatherData);
        this.displayForecast(forecastData);

        this.saveRecentSearch(city);
        localStorage.setItem("lastCity", city);

    } catch (error) {
        console.error(error);
    }
};

WeatherApp.prototype.displayWeather = function (data) {
    this.weatherDisplay.innerHTML = `
        <h2>${data.name}</h2>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>${data.weather[0].description}</p>
    `;
};

WeatherApp.prototype.displayForecast = function (data) {
    this.forecastContainer.innerHTML = "";

    const dailyData = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    );

    dailyData.slice(0, 5).forEach(day => {
        const card = document.createElement("div");
        card.innerHTML = `
            <p>${new Date(day.dt_txt).toDateString()}</p>
            <p>${day.main.temp}°C</p>
        `;
        this.forecastContainer.appendChild(card);
    });
};

WeatherApp.prototype.loadRecentSearches = function () {
    const stored = localStorage.getItem("recentSearches");
    this.recentSearches = stored ? JSON.parse(stored) : [];
    this.displayRecentSearches();
};

WeatherApp.prototype.saveRecentSearch = function (city) {
    city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    this.recentSearches = this.recentSearches.filter(c => c !== city);

    this.recentSearches.unshift(city);

    if (this.recentSearches.length > 5) {
        this.recentSearches.pop();
    }

    localStorage.setItem("recentSearches", JSON.stringify(this.recentSearches));
    this.displayRecentSearches();
};

WeatherApp.prototype.displayRecentSearches = function () {
    this.recentContainer.innerHTML = "";

    this.recentSearches.forEach(function (city) {
        const btn = document.createElement("button");
        btn.textContent = city;
        btn.className = "recent-btn";

        btn.addEventListener("click", () => {
            this.getWeather(city);
        });

        this.recentContainer.appendChild(btn);
    }.bind(this));
};

WeatherApp.prototype.loadLastCity = function () {
    const lastCity = localStorage.getItem("lastCity");
    if (lastCity) {
        this.getWeather(lastCity);
    }
};

WeatherApp.prototype.clearHistory = function () {
    localStorage.removeItem("recentSearches");
    localStorage.removeItem("lastCity");
    this.recentSearches = [];
    this.displayRecentSearches();
};

new WeatherApp();