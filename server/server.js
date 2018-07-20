var http = require('http')
var fs = require('fs')
var url = require('url')
var app = require('../app')
var debug = require('debug')('f-oat-extraction:server');
var ip = require("ip");
console.dir ( ip.address() );

var port = '8080'
app.set('port', port)

var server = http.createServer(app)
console.log("server created on port " + port)

server.listen(port, "0.0.0.0");
server.setTimeout(10800000);
server.on('error', onError);
server.on('listening', onListening);

 /**
  * Normalize a port into a number, string, or false.
  */

/* function normalizePort(val) {
   var port = parseInt(val, 10);

   if (isNaN(port)) {
     // named pipe
     return val;

   if (port >= 0) {
     // port number
     return port;
   }

   return false;
 }

 }*/
 /**
  * Event listener for HTTP server "error" event.
  */

 function onError(error) {
   if (error.syscall !== 'listen') {
     throw error;
   }

   var bind = typeof port === 'string'
     ? 'Pipe ' + port
     : 'Port ' + port;

   // handle specific listen errors with friendly messages
   switch (error.code) {
     case 'EACCES':
       console.error(bind + ' requires elevated privileges');
       process.exit(1);
       break;
     case 'EADDRINUSE':
       console.error(bind + ' is already in use');
       process.exit(1);
       break;
     default:
       throw error;
   }
 }

 /**
  * Event listener for HTTP server "listening" event.
  */

 function onListening() {
   var addr = server.address();
   var bind = typeof addr === 'string'
     ? 'pipe ' + addr
     : 'port ' + addr.port;
   debug('Listening on ' + bind);
 }

var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

/*server.on("request", (request, response) =>{
  console.log("get")
  response.writeHead(200);
  response.write("Being processed")
  if(request.method === 'GET') {
    const myUrl = request.url.href;
    console.log(myUrl)
    const req = http.request('http://localhost:8123' + myUrl, (res) =>{
        res.setEnconding('utf8');
        let rawData = '';
        res.on('data', (chuck) => {rawData += chunk; });
        res.on('end', () =>{
          try{
            const parsedData = JSON.parse(rawData);
            console.log(parsedData);
          } catch (e) {
            console.error(e.message);
          }
        });
      }).on('error', (e) => {
        console.error('got error : ${e.message}');
      });
    response.end();
  }
  else response.end("not found");
});*/


/*server.on("request",(request, response) =>{
  var query = url.parse(request.url, true, true).query
  if (query.type === undefined) {
    response.write("requête inconnue");
  }
  else if (query.type === "param") {
    var param = fs.readFile("../ListeOutilParam/list.html",utf8);
    console.log(param);
    response.end(param);
  }
});
*/
