$(document).ready(function() {

    function getHistoricalData(stockCode, callback) {

        let baseUrl = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=';
        let keyUrl = '&apikey=26BIR4PKMC1G6V0A';

        let url = baseUrl + stockCode + keyUrl;
        $.getJSON(url, function(data) {
            let err = null;
            if (!data || !data['Time Series (Daily)']) {
                err = true;
            }
            callback(err, !err && data['Time Series (Daily)']);
        });
    }

    getHistoricalData('SAS.AX', function(err, data) {

        let keys = Object.keys(data);
        let values = Object.values(data);
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
