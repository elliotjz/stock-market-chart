$(document).ready(function() {

    function getStock(opts, type, callback) {
        let defs = {
            desc: false,
            baseURL: 'http://query.yahooapis.com/v1/public/yql?q=',
            query: {
                quotes: 'select * from yahoo.finance.quotes where symbol = "{stock}" | sort(field="{sortBy}", descending="{desc}")',
                historicaldata: 'select * from yahoo.finance.historicaldata where symbol = "{stock}" and startDate = "{startDate}" and endDate = "{endDate}"'
            },
            suffixURL: {
                quotes: '&env=store://datatables.org/alltableswithkeys&format=json&callback=?',
                historicaldata: '&env=store://datatables.org/alltableswithkeys&format=json&callback=?'
            }
        };

        let URL = 'http://query.yahooapis.com/v1/public/yql?q=';
        let query = 'edit data here to make it work';

        var query = defs.query[type]
        .replace('{stock}', opts.stock)
        .replace('{sortBy}', defs.sortBy)
        .replace('{desc}', defs.desc)
        .replace('{startDate}', opts.startDate)
        .replace('{endDate}', opts.endDate)

        var url = defs.baseURL + query + (defs.suffixURL[type] || '');
        $.getJSON(url, function(data) {
            var err = null;
            if (!data || !data.query) {
                err = true;
            }
            callback(err, !err && data.query.results);    });
    }

    /*
    getStock({ stock: 'AAPL' }, 'quotes', function(err, data) {
        console.log(data);
    });
    */
    getStock({ stock: 'AAPL', startDate: '2013-01-01', endDate: '2013-01-05' }, 'historicaldata', function(err, data) {
        console.log(data);
    });


    // create chart
    var ctx = document.getElementById('my-chart').getContext('2d');
    
    let myData = {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [{
            label: "My First dataset",
            backgroundColor: 'rgba(255,255,255,0)',
            borderColor: 'rgb(255, 99, 132)',
            data: [0, 10, 5, 2, 20, 30, 45],
        }]
    }

    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: myData,
        options: {}
    });

    
})
