
$(document).ready(function() {

	// Collecting stock data
	let stockFromDB = [];
	$('#stock-list').find('li').each(function() {
		console.log('sending li info to DB');
		stockFromDB.push(this.innerHTML.replace(/\-/g, '.'));
	});
    chartStocks(stockFromDB);

    function chartStocks(stocks) {

        console.log("charting " + stocks);

        let promises = [];

        for (let i = 0; i < stocks.length; i++) {
            let p = new Promise(function(resolve, reject) {
            	console.log('promise made for ', stocks[i]);
                getHistoricalData(stocks[i], function(err, data) {
                    if (err) reject(err);
                    console.log('data for ' + stocks[i]);
                    console.log(data);
                    if (data) {
                    	resolve(data);
                    } else {
                    	reject(stocks[i]);
                    }
                    
                })
            })
            promises.push(p);
        }
        Promise.all(promises).then(historicalDataArray => {
            putItOnAChart(stocks, historicalDataArray);
        }, function(stockCode) {
        	console.log('rejectted!!!');
        	console.log(stockCode);
        	$('#message').html('The stock your searched for wansn\'t found.');
        	stockCode = stockCode.replace(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/\s]/g, '-');
	    	socket.emit('remove-stock', {
	    		stock: stockCode
	    	})
        })
    }

    function getHistoricalData(stockCode, callback) {


        let dataFromSessionStorage = JSON.parse(sessionStorage.getItem(stockCode));
        if (dataFromSessionStorage) {
        	console.log('got data for ' + stockCode + 'from sessionStorage');
        	callback(null, dataFromSessionStorage);
        } else {
        	let baseUrl = 'https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=';
	        let keyUrl = '&apikey=26BIR4PKMC1G6V0A';

	        let url = baseUrl + stockCode + keyUrl;
	        $.getJSON(url, function(data) {
	            let err = null;
	            if (!data || !data['Weekly Time Series']) {
	                err = true;
	            }

	            let parsedData = parseData(data['Weekly Time Series']);

	            sessionStorage.setItem(stockCode, JSON.stringify(parsedData));
	            console.log('got data for ' + stockCode + 'from API');
	            if (err) {
	            	callback(stockCode);
	            } else {
	            	callback(err, !err && parsedData);
	            }
	        });
        }
    }

    function putItOnAChart(stocks, historicalDataArray) {

    	// Delete old chart
    	$('#chart-container').remove();


        let datasets = [];
        let labels = [];
        for (let i = 0; i < stocks.length; i++) {

            let itemData = historicalDataArray[i];
            let keys = Object.keys(itemData).reverse();
            let values = Object.values(itemData).reverse();
            
            if (keys.length > labels.length) {
                labels = keys;
            }

            let data = {
                label: stocks[i],
                backgroundColor: 'rgba(0,0,0,0)',
                borderColor: randomColor(),
                data: values,
                pointRadius: 1,
                pointHitRadius: 5,
                borderWidth: 2
            }

            datasets.push(data);
        }

        let options = {
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Price',
                        fontSize: 20
                    }
                }],
                xAxes: [{
                    type: 'time',
                    unit: 'day',
                    unitStepSize: 1,
                    time: {
                        displayFormats: {
                            'day': 'MMM DD'
                        }
                    }
                }]
            },
            legend: {
                onClick: (e) => e.stopPropagation()
            }
        };
        
        // Add new canvas for new chart
        $('#heading').after('<div id="chart-container"><canvas id="my-chart"></canvas></div>');

        console.log('have all the data and chartig: ' + stocks);
        // create chart
        let ctx = document.getElementById('my-chart').getContext('2d');

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: options
        });
    }

    function parseData(fullData) {

        let date = moment();

        let fiveYearsAgo = date.year(date.year() - 5);
        
        let parsedData = {};

        for (key in fullData) {
            let dataDate = moment(key);
            if (dataDate > fiveYearsAgo) {
                parsedData[dataDate.format('D MMM YYYY')] = fullData[key]['4. close'];
            }
        }

        return parsedData;
    }

    function randomColor() {
    	let r1 = Math.round(Math.random() * 255);
    	let r2 = Math.round(Math.random() * 255);
    	let r3 = Math.round(Math.random() * 255);
    	let colorStr = 'rgb(' + r1 + ',' + r2 + ',' + r3 + ')';
  		return colorStr;
	};

    // Make connection
    let socket = io.connect('http://localhost:3000');

    // Emit Events
    $('#search-form').on('submit', function(e) {
    	e.preventDefault();

    	let newStock = $('#search-input').val();
    	newStock = newStock.replace(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/\s]/g, '-');
    	let alreadyInList = false;

    	$('#stock-list').find('li').each(function() {
    		if (this.innerHTML == newStock) {
    			alreadyInList = true;
    		}
    	});

		if (!alreadyInList) {
			$('#message').html('');
	        socket.emit('add-stock', {
	            stock: newStock
	        })
	    } else {
	    	$('#message').html('Stock is already on chart');
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
    	console.log('adding stock to list: ', data.stock);

    	let stocks = [];
    	$('#stock-list').find('li').each(function() {
    		stocks.push(this.innerHTML);
    	});

    	let stockNoDash = data.stock.replace(/\-/g, '.');

    	let html = '<li class="stock" id="' + data.stock + '">' + stockNoDash + '</li>';
    	$('#stock-list').append(html);

    	stocks.push(stockNoDash);
    	
    	console.log("stock added to list.");
        chartStocks(stocks);
    })

    socket.on('remove-stock', function(data) {
    	let id = "#" + data.stock;
    	$(id).remove();
    	let lis = document.getElementById("stock-list").getElementsByTagName("li");
        let stocks = [];
        for (let i = 0; i < lis.length; i++) {
        	stocks.push(lis[i].innerHTML.replace(/\-/g, '.'));
        }
        chartStocks(stocks);
    })

})
