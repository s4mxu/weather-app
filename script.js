// ======================
// CONFIGURAÇÕES DA API
// ======================
const API_KEY = '1350f2428dfc8114d15f2b57b5cdcae2';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const ICON_URL = 'https://openweathermap.org/img/wn';

// Cidade padrão (caso o usuário não permita localização)
const DEFAULT_CITY = 'São Paulo'; // Corrigi para minúsculo (funciona melhor)

// ======================
// ELEMENTOS DO DOM
// ======================
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const currentTemp = document.getElementById('current-temp');
const weatherIcon = document.getElementById('weather-icon');
const weatherDesc = document.getElementById('weather-description');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity'); // CORRIGIDO: 2 'm'
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecast-container');
const lastUpdate = document.getElementById('last-update');
const loading = document.getElementById('loading');
const suggestions = document.querySelectorAll('.suggestion'); // CORRIGIDO

// ======================
// FUNÇÕES AUXILIARES
// ======================

// Formatar data em português
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('pt-BR', options);
}

// Formatar data simples (para previsão)
function formatDay(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { weekday: 'short', day: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
}

// Converter Kelvin para Celsius
function kelvinToCelsius(kelvin) { // CORRIGIDO: parâmetro certo
    return Math.round(kelvin - 273.15);
}

// Converter m/s para km/h
function msToKmh(ms) {
    return Math.round(ms * 3.6);
}

// Obter ícone do clima baseado no código da API
function getWeatherIcon(iconCode) {
    const iconMap = {
        // Clear
        '01d': 'fas fa-sun',
        '01n': 'fas fa-moon',
        // Clouds
        '02d': 'fas fa-cloud-sun',
        '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud',
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud',
        '04n': 'fas fa-cloud',
        // Rain
        '09d': 'fas fa-cloud-rain',
        '09n': 'fas fa-cloud-rain',
        '10d': 'fas fa-cloud-sun-rain',
        '10n': 'fas fa-cloud-moon-rain',
        '11d': 'fas fa-bolt',
        '11n': 'fas fa-bolt',
        // Snow
        '13d': 'fas fa-snowflake',
        '13n': 'fas fa-snowflake',
        // Mist
        '50d': 'fas fa-smog',
        '50n': 'fas fa-smog'
    };

    return iconMap[iconCode] || 'fas fa-question';
}

// Atualizar hora da última atualização
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { // CORRIGIDO: toLocaleTimeString
        hour: '2-digit',
        minute: '2-digit'
    });
    lastUpdate.textContent = timeString;
}

// Mostrar/ocultar loading
function showLoading() {
    loading.style.display = 'flex';
}

function hideLoading() {
    loading.style.display = 'none';
}

// ======================
// FUNÇÕES DA API
// ======================

// Buscar clima atual
async function fetchCurrentWeather(city) {
    try {
        showLoading();

        const response = await fetch(
            `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&lang=pt_br&units=metric` // Adicionei units=metric
        );

        if (!response.ok) {
            throw new Error('Cidade não encontrada');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar clima:', error);
        alert(`Erro: ${error.message}. Tente outra cidade.`);
        return null;
    } finally {
        hideLoading();
    }
}

// Buscar previsão para 5 dias
async function fetchForecast(city) {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&lang=pt_br&cnt=40&units=metric` // Adicionei units=metric
        );

        if (!response.ok) {
            throw new Error('Erro na previsão');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar previsão:', error);
        return null;
    }
}

// Buscar clima por coordenadas (GPS)
async function fetchWeatherByCoords(lat, lon) {
    try {
        showLoading();

        const response = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&lang=pt_br&units=metric` // Adicionei units=metric
        );

        if (!response.ok) {
            throw new Error('Localização não encontrada');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar por localização:', error);
        alert('Não foi possível obter sua localização. Tente buscar manualmente.');
        return null;
    } finally {
        hideLoading();
    }
}

// ======================
// ATUALIZAR INTERFACE
// ======================

// Atualizar informações atuais
function updateCurrentWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    currentDate.textContent = formatDate(data.dt);
    currentTemp.textContent = Math.round(data.main.temp); // Já vem em Celsius com units=metric
    weatherIcon.className = getWeatherIcon(data.weather[0].icon);
    weatherDesc.textContent = data.weather[0].description;

    feelsLike.textContent = `${Math.round(data.main.feels_like)} ºC`;
    humidity.textContent = `${data.main.humidity} %`;
    windSpeed.textContent = `${msToKmh(data.wind.speed)} km/h`;
    pressure.textContent = `${data.main.pressure} hPa`;

    updateLastUpdateTime();
}

// Atualizar previsão
function updateForecast(forecastData) {
    // Limpar Container
    forecastContainer.innerHTML = '';

    // Agrupar por dia (a API retorna de 3 em 3 horas)
    const dailyForecasts = {};

    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString('pt-BR');

        if (!dailyForecasts[date]) {
            dailyForecasts[date] = {
                temps: [],
                icons: [],
                descriptions: []
            };
        }

        dailyForecasts[date].temps.push(item.main.temp);
        dailyForecasts[date].icons.push(item.weather[0].icon);
        dailyForecasts[date].descriptions.push(item.weather[0].description); // CORRIGIDO: description singular
    });

    // Pegar apenas os próximos 5 dias (excluindo hoje)
    const today = new Date().toLocaleDateString('pt-BR');
    const nextDays = Object.entries(dailyForecasts)
        .filter(([date]) => date !== today)
        .slice(0, 5);

    // Criar cards para cada dia
    nextDays.forEach(([date, data]) => {
        const maxTemp = Math.max(...data.temps.map(temp => Math.round(temp)));
        const minTemp = Math.min(...data.temps.map(temp => Math.round(temp)));
        const mostCommonIcon = getMostCommon(data.icons);

        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';

        forecastDay.innerHTML = `
            <p class="day">${formatDay(new Date(date).getTime() / 1000)}</p>
            <i class="forecast-icon ${getWeatherIcon(mostCommonIcon)}"></i>
            <p class="desc">${data.descriptions[0]}</p>
            <div class="temp">
                <span class="max-temp">${maxTemp}º</span>
                <span class="min-temp">${minTemp}º</span>
            </div>
        `;

        forecastContainer.appendChild(forecastDay);
    });
}

// Função auxiliar para encontrar ícone mais comum
function getMostCommon(arr) {
    return arr.sort((a, b) =>
        arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop();
}

// ======================
// FUNÇÃO PRINCIPAL
// ======================

// Carregar dados de uma cidade
async function loadWeatherData(city) {
    const currentData = await fetchCurrentWeather(city);

    if (currentData) {
        updateCurrentWeather(currentData);

        // Buscar previsão
        const forecastData = await fetchForecast(city);
        if(forecastData) {
            updateForecast(forecastData);
        }

        // Salvar última cidade pesquisada
        localStorage.setItem('lastCity', city);
    }
}

// ======================
// EVENT LISTENERS
// ======================

// Buscar cidade
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim(); // CORRIGIDO: value
    if (city) {
        loadWeatherData(city);
        cityInput.value = '';
    }
});

// Enter no input
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Localização por GPS
locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const data = await fetchWeatherByCoords(latitude, longitude);

                if (data) {
                    updateCurrentWeather(data);

                    // Buscar previsão
                    const forecastData = await fetchForecast(data.name);
                    if (forecastData) {
                        updateForecast(forecastData);
                    }

                    localStorage.setItem('lastCity', data.name);
                }
            },
            (error) => {
                console.error('Erro na geolocalização:', error);
                alert('Permissão de localização negada. Busque manualmente.');
            }
        );
    } else {
        alert('Geolocalização não suportada pelo seu navegador.');
    }
});

// Sugestões de cidades
suggestions.forEach(suggestion => {
    suggestion.addEventListener('click', () => {
        const city = suggestion.getAttribute('data-city');
        cityInput.value = city;
        loadWeatherData(city);
    });
});

// ======================
// INICIALIZAÇÃO
// ======================

// Ao carregar página
document.addEventListener('DOMContentLoaded', () => {
    // Tentar carregar última cidade pesquisada
    const lastCity = localStorage.getItem('lastCity') || DEFAULT_CITY;
    loadWeatherData(lastCity);

    // Atualizar hora periodicamente
    setInterval(updateLastUpdateTime, 60000); // A cada minuto
});