
//let socket = io.connect('http://localhost:3000');
let socket = io.connect('https://elliotjz-stock-market-chart.herokuapp.com/');


function chartStocks(stocks, timePereod) {

    let promises = [];

    for (let i = 0; i < stocks.length; i++) {
        let p = new Promise(function(resolve, reject) {

            let spinner = new Spinner().spin();
            $('#' + stocks[i].replace(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/\s]/g, '-')).append(spinner.el);

            getHistoricalData(stocks[i], function(err, data) {
                if (err) reject(err);
                spinner.stop();
                if (data) {
                	resolve(data);
                } else {
                	console.log(err);
                	reject(stocks[i]);
                }
                
            })
        })
        promises.push(p);
    }
    Promise.all(promises).then(historicalDataArray => {
        putItOnAChart(stocks, historicalDataArray, timePereod);
    }, function(stockCode) {
    	// ERROR
    	console.log('Error for ' + stockCode);
    	$('#message').html('The stock you searched for wasn\'t found.');
        $('#message').show(500);
    	stockCode = stockCode.replace(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/\s]/g, '-');
    	socket.emit('remove-stock', {
            stock: stockCode
        })
    })
}

function getHistoricalData(stockCode, callback) {


    let dataFromSessionStorage = JSON.parse(sessionStorage.getItem(stockCode));

    if (dataFromSessionStorage) {
    	console.log('got data for ' + stockCode + ' from sessionStorage');        	
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

            if (err) {
            	callback(stockCode);
            } else {

            	let parsedData = parseDataToStore(data['Weekly Time Series']);

            	sessionStorage.setItem(stockCode, JSON.stringify(parsedData));

            	console.log('got data for ' + stockCode + ' from API');

            	callback(err, !err && parsedData);
            }
        });
    }
}

function putItOnAChart(stocks, historicalDataArray, timePereod) {

	// Delete old chart
	$('#chart-container').remove();

    let dateList;
    let datasets;
    let options;
    if (!!historicalDataArray[0]) {

    	parsedData = parseDataToChart(historicalDataArray, timePereod);

    	dateList = parsedData[0]['dates'];

        datasets = [];
        for (let i = 0; i < stocks.length; i++) {

            let prices = parsedData[i]['prices'];

            let data = {
                label: stocks[i],
                backgroundColor: 'rgba(0,0,0,0)',
                borderColor: randomColor(),
                data: prices,
                pointRadius: 1,
                pointHitRadius: 5,
                borderWidth: 1,
                spanGaps: true
            }

            datasets.push(data);
        }

        options = {
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Percentage Change',
                        fontSize: 20
                    },
                    ticks: {
                    callback: function(value, index, values) {
                        return value + '%';
                    }
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
                    },
                    ticks: {
                    	minRotation: 45
                    }
                }]
            },
            legend: {
                onClick: (e) => e.stopPropagation()
            },
            tooltips: {
        		callbacks: {
            		label: function(tooltipItem, data) {
                		return tooltipItem.yLabel.toFixed(2) + '%';
            		},
            		title: function(toolTipItem, data) {
            			return data.datasets[toolTipItem[0]['datasetIndex']].label;
            		}
        		}
    		}
        };
    } else {
        dateList = [];
        datasets = [];
        options = {};
    }
    
    // Add new canvas for new chart
    $('#time-pereod-form').after('<div id="chart-container"><canvas id="my-chart"></canvas></div>');

    // create chart
    let ctx = document.getElementById('my-chart').getContext('2d');

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dateList,
            datasets: datasets
        },
        options: options
    });
}

function parseDataToStore(fullData) {
	
	let dateList = [];
	let priceList = [];
    let currentDate = moment();
    let startDate = moment().year(currentDate.year() - 5);

    while (startDate < currentDate) {
    	dateList.push(startDate.format('D MMM YYYY'));

    	if (startDate.format('YYYY-MM-DD') in fullData && fullData[startDate.format('YYYY-MM-DD')]['4. close'] > 0) {
    		priceList.push(fullData[startDate.format('YYYY-MM-DD')]['4. close']);
    	} else {
    		priceList.push(null);
    	}
    	startDate = startDate.add(1, 'days');
    }
    return {dates: dateList, prices: priceList};
}

function parseDataToChart(inputData, timePereod) {

	let currentDate = moment();
	let startDate = moment().month(currentDate.month() - timePereod);

	for (let i = 0; i < inputData.length; i++) {
		let newPricesList = [];

		let startingIndex = inputData[i]['dates'].indexOf(startDate.format('D MMM YYYY'));

		// Find Starting Price
		let startingPrice = -1;
		let j = 0;
		while (startingPrice === -1) {
			if (inputData[i]['prices'][startingIndex + j]) {
				startingPrice = inputData[i]['prices'][startingIndex + j];
			}
			j += 1;
		}

		// change price data to percentages and crop to timePereod
		for (j = startingIndex; j < inputData[i]['prices'].length; j++) {
			if (inputData[i]['prices'][j]) {
				newPricesList.push((inputData[i]['prices'][j] / startingPrice - 1 ) * 100);
			} else {
				newPricesList.push(null);
			}
		}
		inputData[i]['prices'] = newPricesList;
		inputData[i]['dates'] = inputData[i]['dates'].slice(startingIndex);
	}

	return inputData;
}

function randomColor() {
	let r1 = Math.round(Math.random() * 200);
	let r2 = Math.round(Math.random() * 200);
	let r3 = Math.round(Math.random() * 200);
	let colorStr = 'rgb(' + r1 + ',' + r2 + ',' + r3 + ')';
		return colorStr;
};
