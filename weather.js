$( document ).ready(function() {
	console.log('ready')

	var location = {
		long:0,
		lat:0,
	}

	var row = $('#row')

	//todo localstorage for search history and current location data 

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


		var li = $('<li>')
		li.append('<span>' + data.name + '</span>')
		li.append('<span>' + formattedTime +'</span>')
		li.append('<img src=' + imgURL + '></img>')
		ul.append(li)

		var li = $('<li>')
		li.append('<span> Temperature: </span>')
		li.append('<span>' + data.main.temp +' K </span>')
		ul.append(li)

		var li = $('<li>')
		li.append('<span> Humidity: </span>')
		li.append('<span>' + data.main.humidity +' % </span>')
		ul.append(li)

		var li = $('<li>')
		li.append('<span> Wind Speed: </span>')
		li.append('<span>' + data.wind.speed +' MPH </span>')
		ul.append(li)

		div.append(ul)
		row.append(div)
	
		cont.append(div).addClass('col-sm-9')
		$('.city').toggleClass('col-sm-11 col-sm-3');
		
	}

	function updateForecast(data){
		

		var cont = $('.weather-content')
		var div = $('<div>').addClass('weather-forecast').addClass('row')


		data.list.forEach(function(elem){
			
			if(elem.dt_txt.split(' ')[1] == '03:00:00'){
				console.log(elem)


				var card = $('<div>').addClass('card').addClass('col-sm-2')
				var cardhead = $('<div>').addClass('card-header')
				//cardhead.text = elem

				var cardbody = $('<div>').addClass('card-body')
				var cardfoot = $('<div>').addClass('card-footer')

				cardhead.append($('<span>').text('test'))

				card.append(cardhead)
				card.append(cardbody)
				card.append(cardfoot)

				div.append(card)
				
			}
		})

		cont.append(div)

	}


	function buildQueryURLs(isCity) {
		
		var queryURLs = {
			currentInfo:'https://api.openweathermap.org/data/2.5/weather?',
			uvIndex:'https://api.openweathermap.org/data/2.5/uvi?',
			fiveDay:'https://api.openweathermap.org/data/2.5/forecast?',
		}

		var key = "95b36b47ad5456a7aec150f269723948"
		var queryParams = { "appid": key };


		if(isCity){
			queryParams.q = $("#search-term").val().trim();
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
		buildQueryURLs(true);
	});





});