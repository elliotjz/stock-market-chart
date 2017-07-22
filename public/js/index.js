
$(document).ready(function() {

	// Collecting stock data
    chartStocks(['AMZN']);

    function chartStocks(stocks) {

        console.log("charting " + stocks);

        let promises = [];

        for (let i = 0; i < stocks.length; i++) {
            let p = new Promise(function(resolve, reject) {
                getHistoricalData(stocks[i], function(err, data) {
                    if (err) reject(err);
                    resolve(data);
                })
            })
            promises.push(p);
        }
        Promise.all(promises).then(historicalDataArray => {
            putItOnAChart(stocks, historicalDataArray);
        })
    }

    function getHistoricalData(stockCode, callback) {


        let dataFromSessionStorage = JSON.parse(sessionStorage.getItem(stockCode));
        if (dataFromSessionStorage) {
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
	            callback(err, !err && parsedData);
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
                pointRadius: 2,
                pointHitRadius: 5
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
    $('#search-form').on('submit', function() {
        socket.emit('add-stock', {
            stock: $('#search-input').val()
        })
    })

    $('body').on('click', 'li.stock', function(e) {
    	let stock = this.innerHTML;
    	socket.emit('remove-stock', {
    		stock: stock
    	})
    	
    })

    // Listen for events
    socket.on('add-stock', function(data) {
    	console.log('adding stock to list');

    	let alreadyInList = false;
    	let stocks = [];

    	$('#stock-list').find('li').each(function() {
    		stocks.push(this.innerHTML.replace(/\-/g, '.'));
    		if (this.innerHTML == data.stock) {
    			alreadyInList = true;
    		}
    	});
    	if (!alreadyInList) {
    		let html = '<li class="stock" id="' + data.stock + '">' + data.stock + '</li>';
    		html = html.replace(/\./g, '-');
    		console.log('html: ', html);
    		$('#stock-list').append(html);
    		stocks.push(data.stock);
    	}
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
