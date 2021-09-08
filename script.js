var cityEnter = document.querySelector("#city-Enter");
var searchBtn = document.querySelector('#search-btn');
var cityName = document.querySelector('#city');
var leftover = [];
var apiKey = '6845bd9653c312c4a4d4b0a988d5d986'; 

var getCoords = function(city) {
    var currentWeatherApi = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

    fetch(currentWeatherApi).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                var lon = data.coord['lon'];
                var lat = data.coord['lat'];
                getCityForecast(city, lon, lat);

                if (document.querySelector('.city-list')) {
                    document.querySelector('.city-list').remove();
                }

                saveCity(city);
                loadCities();
            });
        } else {
            alert(`Error: ${response.statusText}`)
        }
    })
    .catch(function(error) {
        alert('Unable to load weather.');
    })
}
var handler = function(event) {

    var cityImput = cityEnter
        .value
        .trim()
        .toLowerCase()
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');

    if (cityImput) {
        getCoords(cityImput);
        cityEnter.value = '';
    } else {
        alert("Gotta enter a city");
    };
};

var getCityForecast = function(city, lon, lat) {
    var oneCallApi = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly,alerts&appid=${apiKey}`;
    fetch(oneCallApi).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
               
                cityName.textContent = `${city} (${moment().format("M/D/YYYY")})`; 
                currentForecast(data);
                fiveDayForecast(data);
            });
        }
    })
}

var displayTemp = function(element, temperature) {
    var tempEl = document.querySelector(element);
    var elementText = Math.round(temperature);
    tempEl.textContent = elementText;
}

var currentForecast = function(forecast) {
    
    var forecastEl = document.querySelector('.city-forecast');
    forecastEl.classList.remove('hide');

    var weatherIconEl = document.querySelector('#today-icon');
    var currentIcon = forecast.current.weather[0].icon;
    weatherIconEl.setAttribute('src', `http://openweathermap.org/img/wn/${currentIcon}.png`);
    weatherIconEl.setAttribute('alt', forecast.current.weather[0].main)

    displayTemp('#current-temp', forecast.current['temp']);
    displayTemp('#current-feels-like', forecast.current['feels_like']);
    displayTemp('#current-high', forecast.daily[0].temp.max);
    displayTemp('#current-low', forecast.daily[0].temp.min);

    var currentConditionEl = document.querySelector('#current-condition');
    currentConditionEl.textContent = forecast.current.weather[0].description
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');

    var currentHumidityEl = document.querySelector('#current-humidity');
    currentHumidityEl.textContent = forecast.current['humidity'];

    var currentWindEl = document.querySelector('#current-wind-speed')
    currentWindEl.textContent = forecast.current['wind_speed'];
}

var fiveDayForecast = function(forecast) { 
    
    for (var i = 1; i < 6; i++) {
        var dateP = document.querySelector('#date-' + i);
        dateP.textContent = moment().add(i, 'days').format('M/D/YYYY');

        var iconImg = document.querySelector('#icon-' + i);
        var iconCode = forecast.daily[i].weather[0].icon;
        iconImg.setAttribute('src', `http://openweathermap.org/img/wn/${iconCode}.png`);
        iconImg.setAttribute('alt', forecast.daily[i].weather[0].main);

        displayTemp('#temp-' + i, forecast.daily[i].temp.day);
        displayTemp('#high-' + i, forecast.daily[i].temp.max);
        displayTemp('#low-' + i, forecast.daily[i].temp.min);

        var humiditySpan = document.querySelector('#humidity-' + i);
        humiditySpan.textContent = forecast.daily[i].humidity;
    }
}

var saveCity = function(city) {

    for (var i = 0; i < leftover.length; i++) {
        if (city === leftover[i]) {
            leftover.splice(i, 1);
        }
    }

    leftover.push(city);
    localStorage.setItem('cities', JSON.stringify(leftover));
}

var loadCities = function() {
    leftover = JSON.parse(localStorage.getItem('cities'));

    if (!leftover) {
        leftover = [];
        return false;
    } else if (leftover.length > 10) {

        leftover.shift();
    }

    var recentCities = document.querySelector('#recent-cities');
    var cityListUl = document.createElement('ul');
    cityListUl.className = 'list-group list-group-flush city-list';
    recentCities.appendChild(cityListUl);

    for (var i = 0; i < leftover.length; i++) {
        var cityListItem = document.createElement('button');
        cityListItem.setAttribute('type', 'button');
        cityListItem.className = 'list-group-item';
        cityListItem.setAttribute('value', leftover[i]);
        cityListItem.textContent = leftover[i];
        cityListUl.prepend(cityListItem);
    }

    var cityList = document.querySelector('.city-list');
    cityList.addEventListener('click', selectRecent)
}

var selectRecent = function(event) {
    var clickedCity = event.target.getAttribute('value');

    getCoords(clickedCity);
}

loadCities();
searchBtn.addEventListener('click', handler);
