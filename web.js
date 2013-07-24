var fs = require('fs');
var express = require('express');
var app = express();
app.use(express.logger());

app.get('/', function(request, response) {
  fs.readfile('index.html', function (err, data){
    if (err) throw err;
    response.send('Hello World!2');
  });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
  
