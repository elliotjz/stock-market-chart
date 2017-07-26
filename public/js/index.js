
$(document).ready(function() {

    $('#message').hide();

	// Collecting stock data
	let stockFromDB = [];
	$('#stock-list').find('li').each(function() {
		stockFromDB.push(this.innerHTML.replace(/\-/g, '.'));
	});

	let initialTimePereod = parseInt($('.selected-time').attr('id').substr(4));
    chartStocks(stockFromDB, initialTimePereod, false);


    // Connect to socket
    //let socket = io.connect('http://localhost:3000');
    let socket = io.connect('https://elliotjz-stock-market-chart.herokuapp.com/');


    // Emit Events
    $('#search-form').on('submit', function(e) {
    	e.preventDefault();

    	let newStock = $('#search-input').val().toUpperCase();

    	let alreadyInList = false;
    	$('#stock-list').find('li').each(function() {
    		if (this.innerHTML == newStock) {
    			alreadyInList = true;
    		}
    	});

		if (!alreadyInList) {
			$('#message').hide();
            // add stock to list and get stock list
            let stocks = addStockToList(newStock);
            
            let timePereod = parseInt($('.selected-time').attr('id').substr(4));

            chartStocks(stocks, timePereod, true);

	    } else {
	    	$('#message').html('Stock is already on chart');
            $('#message').show(500);
	    }
    })

    $('body').on('click', 'li.stock', function(e) {
    	let stock = this.innerHTML.replace(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/\s]/g, '-');
    	socket.emit('remove-stock', {
            stock: stock
        })
    })


    // Listen for events
    socket.on('add-stock', function(data) {

        // update stock list
        $('.stock').remove();

        for (let i = 0; i < data.stocks.length; i++) {
            let stockWithDash = data.stocks[i].replace(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/\s]/g, '-');
            let html = '<li class="stock" id="' + stockWithDash + '">' + data.stocks[i] + '</li>';
            $('#stock-list').append(html);
        }

        let timePereod = parseInt($('.selected-time').attr('id').substr(4));

    	putItOnAChart(data.stocks, data.historicalDataArray, timePereod);
    })

    socket.on('remove-stock', function(data) {
    	
        let stocks = removeStockFromList(data.stock);

        let timePereod = parseInt($('.selected-time').attr('id').substr(4));

        chartStocks(stocks, timePereod, true);
    })

    // Time pereod adjustment
    $('.time-btn').on('click', function(e) {
    	$('.selected-time').removeClass('selected-time');
    	$(this).addClass('selected-time');
    	let timePereod = parseInt(this.id.substr(4));

    	let lis = document.getElementById("stock-list").getElementsByTagName("li");
        let stocks = [];
        for (let i = 0; i < lis.length; i++) {
        	stocks.push(lis[i].innerHTML.replace(/\-/g, '.'));
        }
        chartStocks(stocks, timePereod, false);
    })
})

// console.log(typeof parseInt(this.id.substr(4)));
