var express = require('express');
var bodyParser = require('body-parser');

var serviceApi = require('./server/serviceApi');

var app = express();
app.use(bodyParser());
app.use(express.static('.'));

app.get('/api/getall', function(request, response) {
    var data = serviceApi.getBooks();
    response.send(data);
});

app.get('/api/getmissionlist', function(request, response) {
    var data = serviceApi.getMissionList();
    response.send(data);
});

app.get('/', function(request, response) {
    console.log('Index server started!!!');
    response.sendfile('Index.html');
});

app.listen(9001, function() {
    console.log('Express server started!!!');
});