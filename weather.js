$( document ).ready(function() {
	console.log('ready')

	var location = {
		long:0,
		lat:0,
	}
	var cities 
	var row = $('#row')
	var city = $('.city')
	
	var tempCities = JSON.parse(localStorage.getItem('cities'));

	if(typeof(tempCities) != "undefined" && tempCities != null){

		tempCities.forEach(function(key){
			var button = $('<button>' + key+ '</button>' ); 
			button.addClass('citySearch')
			button.attr("city", key )
			city.append(button)
		})
	}


	if (!navigator.geolocation) {
		status.textContent = 'Geolocation is not supported by your browser';
	} else {
		status.textContent = 'Locating…';
		navigator.geolocation.getCurrentPosition(success, error);
	}

	function success(position) {
		location.lat  = position.coords.latitude;
		location.long = position.coords.longitude;
		buildQueryURLs(false)
	}

	function error() {
		console.log(error)
	}

	function updateUV(elem){
		var ul = $('.weather-info')
		var li = $('<li>')
		li.append($('<span> UV Index: </span>').addClass('title3'))
		var uv = $('<span>' + elem.value + '</span>');
		uv.addClass('uv')
		li.append(uv)
		li.append('<br>')
		li.append('<br>')
		ul.append(li)

	}
	function updateCurrent(data){
	
		var cont = $('.weather-content')
		var div = $('<div>').addClass('weather-current')

		var ul = $('<ul></ul>').addClass('weather-info')

		var imgURL = 'http://openweathermap.org/img/wn/' + data.weather[0].icon + '.png'
		
		var date = new Date(data.dt * 1000);
		var hours = date.getHours();
		var minutes = "0" + date.getMinutes();
		var seconds = "0" + date.getSeconds();
		var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);


		if(cont.children().length > 0 ){
			cont.empty()
		} else {
			city.toggleClass('col-sm-11 col-sm-3');
		}

		var li = $('<li>')
		li.append('<br>')
		li.append('<span>' + data.name + '  </span>').addClass('title2')
		li.append('<span>' + formattedTime +'  </span>').addClass('title2')
		li.append('<img src=' + imgURL + '></img>')
		li.append('<br>')
		ul.append(li)

		var li = $('<li>')
		li.append('<span> Temperature: </span>').addClass('title3')
		li.append('<span>' + data.main.temp +' K </span>').addClass('title3')
		li.append('<br>')
		ul.append(li)

		var li = $('<li>')
		li.append('<span> Humidity: </span>').addClass('title3')
		li.append('<span>' + data.main.humidity +' % </span>').addClass('title3')
		li.append('<br>')
		ul.append(li)

		var li = $('<li>')
		li.append('<span> Wind Speed: </span>').addClass('title3')
		li.append('<span>' + data.wind.speed +' MPH </span>').addClass('title3')
		li.append('<br>')
		ul.append(li)



		div.append(ul)
		row.append(div)
	
		cont.append(div).addClass('col-sm-9')
		

		
		
	}

	function updateForecast(data){
		

		var cont = $('.weather-content')
		
		var div = $('<div>').addClass('weather-forecast').addClass('row')


		data.list.forEach(function(elem){
			
			if(elem.dt_txt.split(' ')[1] == '03:00:00'){
				

				var card = $('<div>').addClass('card').addClass('col-sm mr-4')
				var cardhead = $('<div>').addClass('card-header')
				var cardbody = $('<div>').addClass('card-body')
				var cardfoot = $('<div>').addClass('card-footer')
				var imgURL = 'http://openweathermap.org/img/wn/' + elem.weather[0].icon + '.png'
				
				cardhead.append($('<p>').text(elem.dt_txt.split(' ')[0])).addClass('title3')
				cardbody.append('<img src=' + imgURL + '></img>')
				cardfoot.append($('<span>').text('Temp: '))
				cardfoot.append($('<span>').text(elem.main.temp + ' K'))
				cardfoot.append($('<br>'))
				cardfoot.append($('<span>').text('Humidity: '))
				cardfoot.append($('<span>').text(elem.main.humidity + ' %'))

				card.append(cardhead)
				card.append(cardbody)
				card.append(cardfoot)

				div.append(card)
				
			}
		})

		cont.append(div)

	}


	function buildQueryURLs(cityName) {
		
		var queryURLs = {
			currentInfo:'https://api.openweathermap.org/data/2.5/weather?',
			uvIndex:'https://api.openweathermap.org/data/2.5/uvi?',
			fiveDay:'https://api.openweathermap.org/data/2.5/forecast?',
		}

		var key = "95b36b47ad5456a7aec150f269723948"
		var queryParams = { "appid": key };


		if(cityName != ""){	
			var button = $('<button>' + cityName+ '</button>' ); 
			button.addClass('citySearch')
			button.attr("city", cityName )
			queryParams.q =cityName
			cities = $('.citySearch').map(function() {
				return $(this).attr('city');   // or just `return this.title`
			}).get();	

			if(!cities.includes(cityName)){
				city.append(button)
				cities.push(cityName)
			}
			
			localStorage.setItem('cities', JSON.stringify(cities));


		}else{
			queryParams.lat = location.lat
			queryParams.lon = location.long
		}
			
		$.ajax({
			url: queryURLs.currentInfo + $.param(queryParams),
			method: "GET"
		}).then(function(response){

			var uvParams = { "appid": key };
			uvParams.lat = response.coord.lat
			uvParams.lon = response.coord.lon
			updateCurrent(response)

			$.ajax({
				url: queryURLs.uvIndex + $.param(uvParams),
				method: "GET"
			}).then(function(response){
			
				updateUV(response)

			});

			$.ajax({
				url: queryURLs.fiveDay + $.param(queryParams),
				method: "GET"
			}).then(function(response){
			 	updateForecast(response)
			});

		})
	}

	$("#run-search").on("click", function(event) {
		console.log('click')
		event.preventDefault();	
		buildQueryURLs( $("#search-term").val().trim());
	});

 	$(document).on("click", ".citySearch", function(event){

		event.preventDefault();	
		var cityResearch = $(this).attr("city")
		$("#search-term").val(cityResearch) 
		buildQueryURLs(cityResearch)
		
	});

});