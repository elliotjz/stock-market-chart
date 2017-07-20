$(document).ready(function() {

    function getHistoricalData(stockCode, callback) {

        let baseUrl = 'https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=';
        let keyUrl = '&apikey=26BIR4PKMC1G6V0A';

        let url = baseUrl + stockCode + keyUrl;
        $.getJSON(url, function(data) {
            let err = null;
            if (!data || !data['Weekly Time Series']) {
                err = true;
            }
            callback(err, !err && data['Weekly Time Series']);
        });
    }

    chartStocks(['GOOG', 'MSFT']);

    function chartStocks(stocks) {

    }
    
    getHistoricalData('FBR.AX', function(err, data) {

        let date = new Date();
        let fiveYearsAgo = date.setYear(date.getYear() + 1900 - 5);
        
        let fiveYearData = {};
        for (item in data) {
            let dataDate = new Date(item);
            if (dataDate > fiveYearsAgo) {
                fiveYearData[item.split(' ')[0]] = data[item];
            }
        }

        let keys = Object.keys(fiveYearData);
        let values = Object.values(fiveYearData).reverse;
        let closePrices = [];
        for (let i = 0; i < values.length; i++) {
            closePrices.push(values[i]["4. close"]);
        }

        // create chart
        let ctx = document.getElementById('my-chart').getContext('2d');
        
        let myData = {
            labels: keys,
            datasets: [{
                label: "APPL",
                backgroundColor: 'rgba(0,0,0,0)',
                borderColor: 'rgb(255, 99, 132)',
                data: closePrices,
            }]
        }

        let myLineChart = new Chart(ctx, {
            type: 'line',
            data: myData,
            options: {}
        });
    });
})
