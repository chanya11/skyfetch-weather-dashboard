const apiKey = "d1089b1693dc4ebb049726c2b7575343";
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const weatherDisplay = document.getElementById("weather-display");

/* Show Loading */
function showLoading() {
    weatherDisplay.innerHTML = `
        <div class="spinner"></div>
        <p>Loading weather data...</p>
    `;
}

/* Show Error */
function showError(message) {
    weatherDisplay.innerHTML = `
        <div class="error-message">
            <h3>❌ Error</h3>
            <p>${message}</p>
        </div>
    `;
}

/* Display Weather */
function displayWeather(data) {
    const html = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <p><strong>🌡 Temperature:</strong> ${data.main.temp} °C</p>
        <p><strong>🌥 Condition:</strong> ${data.weather[0].description}</p>
        <p><strong>💧 Humidity:</strong> ${data.main.humidity}%</p>
        <p><strong>🌬 Wind Speed:</strong> ${data.wind.speed} m/s</p>
    `;
    weatherDisplay.innerHTML = html;
}

/* Fetch Weather (Async/Await) */
async function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        showLoading();
        searchBtn.disabled = true;

        const response = await axios.get(url);

        displayWeather(response.data);

    } catch (error) {
        showError("City not found. Please enter a valid city name.");
    } finally {
        searchBtn.disabled = false;
    }
}

/* Event Listener - Button Click */
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    getWeather(city);
    cityInput.value = "";
});

/* Event Listener - Enter Key */
cityInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});