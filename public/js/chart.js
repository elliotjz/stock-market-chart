$(document).ready(function() {

    function getHistoricalData(stockCode, callback) {

        console.log("getting historical data for " + stockCode);

        let baseUrl = 'https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=';
        let keyUrl = '&apikey=26BIR4PKMC1G6V0A';

        let url = baseUrl + stockCode + keyUrl;
        $.getJSON(url, function(data) {
            let err = null;
            if (!data || !data['Weekly Time Series']) {
                err = true;
            }
            console.log('data for ' + stockCode + ":");
            console.log(data);
            callback(err, !err && data['Weekly Time Series']);
        });
    }

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
            console.log("promise created for " + stocks[i]);
        }
        Promise.all(promises).then(historicalDataArray => {
            console.log("Collected nececary information. Stock price data:");
            console.log(historicalDataArray);
            putItOnAChart(stocks, historicalDataArray);
        })
    }


    chartStocks(['AMZN', 'FB']);

    function putItOnAChart(stocks, historicalDataArray) {

        let datasets = [];
        let labels = [];
        for (let i = 0; i < stocks.length; i++) {

            let parsedData = parseData(historicalDataArray[i]);
            let keys = Object.keys(parsedData).reverse();
            let values = Object.values(parsedData).reverse();
            
            if (keys.length > labels.length) {
                labels = keys;
            }

            let data = {
                label: stocks[i],
                backgroundColor: 'rgba(0,0,0,0)',
                borderColor: 'rgb(255, 99, 132)',
                data: values
            }

            datasets.push(data);
        }
        
        // create chart
        let ctx = document.getElementById('my-chart').getContext('2d');
        
        let myData = {
            labels: labels,
            datasets: datasets
        }

        let myLineChart = new Chart(ctx, {
            type: 'line',
            data: myData,
            options: {}
        });
    }

    function parseData(fullData) {

        let date = new Date();
        let fiveYearsAgo = date.setYear(date.getYear() + 1900 - 5);
        
        let parsedData = {};
        for (key in fullData) {
            let dataDate = new Date(key);
            if (dataDate > fiveYearsAgo) {
                parsedData[key.split(' ')[0]] = fullData[key]['4. close'];
            }
        }

        console.log("parsed data:");
        console.log(parsedData);
        return parsedData;
    }
})
