// ======================
// CONFIGURAÇÕES DA API
// ======================
const API_KEY = '1350f2428dfc8114d15f2b57b5cdcae2';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const ICON_URL = 'https://openweathermap.org/img/wn';

// ======================
// API DE GEOLOCALIZAÇÃO REVERSA (Para obter estado)
// ======================
const GEO_API_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

// Mapeamento de nomes de estados para siglas
const ESTADOS_BRASIL = {
    'Acre': 'AC',
    'Alagoas': 'AL',
    'Amapá': 'AP',
    'Amazonas': 'AM',
    'Bahia': 'BA',
    'Ceará': 'CE',
    'Distrito Federal': 'DF',
    'Espírito Santo': 'ES',
    'Goiás': 'GO',
    'Maranhão': 'MA',
    'Mato Grosso': 'MT',
    'Mato Grosso do Sul': 'MS',
    'Minas Gerais': 'MG',
    'Pará': 'PA',
    'Paraíba': 'PB',
    'Paraná': 'PR',
    'Pernambuco': 'PE',
    'Piauí': 'PI',
    'Rio de Janeiro': 'RJ',
    'Rio Grande do Norte': 'RN',
    'Rio Grande do Sul': 'RS',
    'Rondônia': 'RO',
    'Roraima': 'RR',
    'Santa Catarina': 'SC',
    'São Paulo': 'SP',
    'Sergipe': 'SE',
    'Tocantins': 'TO'
};

// Lista de cidades brasileiras (para evitar confusão com cidades homônimas no exterior)
const CIDADES_BRASILEIRAS = [
    'Salvador', 'São Paulo', 'Rio de Janeiro', 'Brasília', 'Fortaleza',
    'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre',
    'Belém', 'Goiânia', 'Guarulhos', 'Campinas', 'São Luís', 'Maceió',
    'Teresina', 'Natal', 'João Pessoa', 'Aracaju', 'Florianópolis',
    'Vitória', 'Cuiabá', 'Campo Grande', 'Teresópolis', 'Terezinha'
];

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
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecast-container');
const lastUpdate = document.getElementById('last-update');
const loading = document.getElementById('loading');
const suggestions = document.querySelectorAll('.suggestion');
const themeToggle = document.getElementById('theme-toggle');
// NOVO: Elementos do Sol
const sunriseEl = document.getElementById('sunrise');
const sunsetEl = document.getElementById('sunset');
// NOVO: Botão de favorito
const favoriteBtn = document.getElementById('favorite-btn');
const favoriteIcon = favoriteBtn ? favoriteBtn.querySelector('i') : null;
// NOVO: Sidebar de favoritos
const favoritesSidebar = document.getElementById('favorites-sidebar');
const favoritesList = document.getElementById('favorites-list');
const openSidebarBtn = document.getElementById('open-sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar');
const clearFavoritesBtn = document.getElementById('clear-favorites');
const favoritesCountEl = document.getElementById('favorites-count');


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

// Formatar hora (HH:MM) a partir de timestamp UNIX
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // formato 24h
    });
}

// Calcular duração do dia (BÔNUS)
function calculateDaylight(sunrise, sunset) {
    const daylightSeconds = sunset - sunrise;
    const hours = Math.floor(daylightSeconds / 3600);
    const minutes = Math.floor((daylightSeconds % 3600) / 60);
    return `${hours}h ${minutes}min`;
}

// Obter sigla do estado a partir das coordenadas
async function getEstadoFromCoords(lat, lon) {
    try {
        const response = await fetch(
            `${GEO_API_URL}?latitude=${lat}&longitude=${lon}&localityLanguage=pt`
        );
        
        if (!response.ok) {
            throw new Error('Erro ao buscar localização');
        }
        
        const data = await response.json();
        
        // Tenta obter o estado de diferentes formas
        const estado = data.principalSubdivision || data.region || data.state;
        
        if (estado) {
            // Remove "State" ou "Estado" do nome, se existir
            const estadoLimpo = estado.replace('State', '').replace('Estado', '').trim();
            
            // Tenta encontrar no nosso mapeamento
            const sigla = ESTADOS_BRASIL[estadoLimpo];
            
            if (sigla) {
                return sigla;
            }
            
            // Se não encontrou no mapeamento, retorna as primeiras letras
            return estadoLimpo.substring(0, 2).toUpperCase();
        }
        
        return 'BR'; // Fallback
    } catch (error) {
        console.error('Erro ao buscar estado:', error);
        return 'BR'; // Fallback
    }
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
async function updateCurrentWeather(data) {
    let estadoSigla = 'BR'; // Valor padrão
    
    // Tentar obter a sigla do estado
    if (data.coord) {
        estadoSigla = await getEstadoFromCoords(data.coord.lat, data.coord.lon);
    }
    
    const cidade = `${data.name}, ${estadoSigla}`;
    cityName.textContent = cidade;
    currentDate.textContent = formatDate(data.dt);
    currentTemp.textContent = Math.round(data.main.temp);
    weatherIcon.className = getWeatherIcon(data.weather[0].icon);
    weatherDesc.textContent = data.weather[0].description;

    feelsLike.textContent = `${Math.round(data.main.feels_like)} ºC`;
    humidity.textContent = `${data.main.humidity} %`;
    windSpeed.textContent = `${msToKmh(data.wind.speed)} km/h`;
    pressure.textContent = `${data.main.pressure} hPa`;

    // Atualizar botão de favorito
    const cityNameOnly = data.name;
    updateFavoriteButton(isCityFavorited(cityNameOnly));

    // Nascer e Pôr do Sol
    if (data.sys && data.sys.sunrise && data.sys.sunset) {
        sunriseEl.textContent = formatTime(data.sys.sunrise);
        sunsetEl.textContent = formatTime(data.sys.sunset);

        const daylight = calculateDaylight(data.sys.sunrise, data.sys.sunset);
        console.log(`🌅 Nascer: ${formatTime(data.sys.sunrise)} | 🌇 Pôr: ${formatTime(data.sys.sunset)} | ☀️ Dia: ${daylight}`);

        updateThemeBasedOnTime(data.sys.sunrise, data.sys.sunset);
    } else {
        sunriseEl.textContent = '--:--';
        sunsetEl.textContent = '--:--';
    }
}

// Atualizar previsão (VERSÃO SIMPLIFICADA E CORRETA)
function updateForecast(forecastData) {
    // Limpar Container
    forecastContainer.innerHTML = '';

    // Agrupar por dia
    const dailyForecasts = {};
    const hoje = new Date().toLocaleDateString('pt-BR');

    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString('pt-BR');
        
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = {
                temps: [],
                icons: [],
                descriptions: [],
                dateObj: new Date(item.dt * 1000)
            };
        }
        
        dailyForecasts[date].temps.push(item.main.temp);
        dailyForecasts[date].icons.push(item.weather[0].icon);
        dailyForecasts[date].descriptions.push(item.weather[0].description);
    });

    // Converter para array, remover hoje, ordenar por data
    const nextDays = Object.entries(dailyForecasts)
        .filter(([date]) => date !== hoje)
        .sort((a, b) => a[1].dateObj - b[1].dateObj)
        .slice(0, 5);

    if (nextDays.length === 0) {
        forecastContainer.innerHTML = '<div class="forecast-day"><p>Carregando...</p></div>';
        return;
    }

    // Criar cards
    nextDays.forEach(([date, data]) => {
        const maxTemp = Math.round(Math.max(...data.temps));
        const minTemp = Math.round(Math.min(...data.temps));
        const mostCommonIcon = getMostCommon(data.icons);
        
        // Formatar: "Ter 12"
        const dayName = data.dateObj.toLocaleDateString('pt-BR', { weekday: 'short' });
        const dayNumber = data.dateObj.getDate();
        
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';

        forecastDay.innerHTML = `
            <p class="day">${dayName} ${dayNumber}</p>
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
    let cidadeParaBuscar = city;
    
    // Se for uma cidade brasileira conhecida, adiciona ",BR" para evitar confusão
    if (CIDADES_BRASILEIRAS.includes(city)) {
        cidadeParaBuscar = `${city},BR`;
    }
    
    const currentData = await fetchCurrentWeather(cidadeParaBuscar);

    if (currentData) {
        updateCurrentWeather(currentData);

        // Buscar previsão
        const forecastData = await fetchForecast(cidadeParaBuscar);
        if(forecastData) {
            updateForecast(forecastData);
        }

        // Salvar última cidade pesquisada (sem o ,BR)
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

// Tema
themeToggle.addEventListener('click', toggleTheme);

// Favoritos
if (favoriteBtn) {
    favoriteBtn.addEventListener('click', toggleFavorite);
}

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

    // Inicializar tema
    initTheme();

    // Inicializar sidebar de favoritos
    initFavoritesSidebar();

    // Atualizar contador inicial
    updateFavoritesList();
});

// ======================
// CONTROLE DE TEMA
// ======================

// Elementos do tema
const themeIcon = themeToggle.querySelector('i');

// Verificar tema salvo ou preferência do sistema
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Se tem tema salvo, usa ele. Senão, usa preferência do sistema.
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        enableDarkMode();
    } else {
        enableLightMode();
    }
}

// Ativar modo escuro
function enableDarkMode() {
    document.body.classList.add('dark-mode');
    themeIcon.className = 'fas fa-sun';
    themeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
    localStorage.setItem('theme', 'dark');
}

// Ativar modo claro
function enableLightMode() {
    document.body.classList.remove('dark-mode');
    themeIcon.className = 'fas fa-moon';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Escuro';
    localStorage.setItem('theme', 'light');
}

// Alternar tema
function toggleTheme() {
    if (document.body.classList.contains('dark-mode')) {
        enableLightMode();
    } else {
        enableDarkMode();
    }
}

// Tema automático baseado no horário (opcional)
function updateThemeBasedOnTime(sunrise, sunset) {
    const now = Math.floor(Date.now() / 1000);
    const isNight = now < sunrise || now > sunset;

    if (isNight && !document.body.classList.contains('dark-mode')) {
        enableDarkMode();
    } else if (!isNight && document.body.classList.contains('dark-mode')) {
        enableLightMode();
    }
}

// ======================
// SISTEMA DE FAVORITOS
// ======================

// Carregar favoritos do LocalStorage
function loadFavorites() {
    return JSON.parse(localStorage.getItem('weatherFavorites')) || [];
}

// Salvar favoritos do LocalStorage
function saveFavorites(favorites) {
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
}

// Verificar se cidade atual é favorita
function isCityFavorited(city) {
    const favorites = loadFavorites();
    return favorites.includes(city);
}

// Alternar favorito (adicionar/remover)
function toggleFavorite() {
    const city = cityName.textContent.split(',')[0].trim();

    if (!city || city === '--') {
        showNotification('Busque uma cidade primeiro!', 'error');
        return;
    }

    let favorites = loadFavorites();

    if (isCityFavorited(city)) {
        // Remover dos favoritos
        favorites = favorites.filter(fav => fav !== city);
        updateFavoriteButton(false);
        showNotification(`❌ ${city} removido dos favoritos`, 'info');
    } else {
        // Adicionar aos favoritos
        favorites.push(city);
        updateFavoriteButton(true);
        showNotification(`❤️ ${city} adicionado aos favoritos!`, 'success');
    }

    saveFavorites(favorites);
    updateFavoritesList(); // ATUALIZA A SIDEBAR
}

// Atualizar aparência o botão
function updateFavoriteButton(isFavorited) {
    if (!favoriteBtn || !favoriteIcon) return;

    if (isFavorited) {
        favoriteBtn.classList.add('favorited');
        favoriteIcon.className = 'fas fa-heart';
        favoriteBtn.title = 'Remover dos favoritos';
    } else {
        favoriteBtn.classList.remove('favorited');
        favoriteIcon.className = 'far fa-heart';
        favoriteBtn.title = 'Adicionar aos favoritos';
    }
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Estilos básicos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;

    // Cores por tipo
    if (type === 'success') {
        notification.style.background = '#27ae60';
    } else if (type === 'error') {
        notification.style.background = '#e74c3c';
    } else {
        notification.style.background = '#3498db';
    }

    document.body.appendChild(notification);

    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ======================
// SIDEBAR DE FAVORITOS
// ======================

// Abrir/fechar sidebar
function toggleSidebar() {
    favoritesSidebar.classList.toggle('open');
}

// Atualizar lista de favoritos na sidebar
function updateFavoritesList() {
    const favorites = loadFavorites();

    // Atualizar contador
    favoritesCountEl.textContent = favorites.length;

    // Limpar lista
    favoritesList.innerHTML = '';

    if (favorites.length === 0) {
        // Mostrar mensagem de vazio
        const emptyItem = document.createElement('li');
        emptyItem.className = 'empty-message';
        emptyItem.textContent = 'Nenhuma cidade favoritada ainda';
        favoritesList.appendChild(emptyItem);
        return;
    }

    // Adicionar cada favorito
    favorites.forEach(city => {
        const listItem = document.createElement('li');

        listItem.innerHTML = `
            <span class="city-name">${city}</span>
            <button class="remove-btn" data-city="${city}" title="Remover">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Clique para carregar cidade
        listItem.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-btn')) {
                loadWeatherData(city);
                toggleSidebar();
                showNotification(`⛅ Carregando ${city}...`, 'info');
            }
        });

        // Botão de remover
        const removeBtn = listItem.querySelector('.remove-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede de carregar a cidade
            removeFromFavorites(city);
        });

        favoritesList.appendChild(listItem);
    });
}

// Remover cidade dos favoritos
function removeFromFavorites(city) {
    let favorites = loadFavorites();
    favorites = favorites.filter(fav => fav !== city);
    saveFavorites(favorites);

    // Atualizar interface
    updateFavoritesList();
    updateFavoriteButton(isCityFavorited(cityName.textContent.split(',')[0]));

    showNotification(`❌ ${city} removido dos favoritos`, 'info');
}

// Limpar todos os favoritos
function clearAllFavorites() {
    if (loadFavorites().length === 0) {
        showNotification('Não há favoritos para limpar', 'info');
        return;
    }

    if (confirm('Tem certeza que deseja remover TODOS os favoritos?')) {
        localStorage.removeItem('weatherFavorites');
        updateFavoritesList();
        updateFavoriteButton(false);
        showNotification('✅ Todos os favoritos foram removidos', 'success');
    }
}

// Inicializar sidebar
function initFavoritesSidebar() {
    updateFavoritesList();

    // Event listeners
    if (openSidebarBtn) {
        openSidebarBtn.addEventListener('click', toggleSidebar);
    }

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', toggleSidebar);
    }

    if (clearFavoritesBtn) {
        clearFavoritesBtn.addEventListener('click', clearAllFavorites);
    }

    // Fechar sidebar ao clicar fora (opcional)
    document.addEventListener('click', (e) => {
        if (favoritesSidebar.classList.contains('open') &&
            !favoritesSidebar.contains(e.target) &&
            e.target !== openSidebarBtn &&
            !openSidebarBtn.contains(e.target)) {
                toggleSidebar();
            }
    });
}