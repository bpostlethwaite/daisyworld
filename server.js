"use strict";
var server = require("node-static")
  , app = require("http").createServer(handler)

var port = 8082
app.listen(port)
console.log("Static server listening on " + port)

//
// BORING SERVER
//
var clientFiles = new server.Server("./public")

function handler(request, response) {
  request.addListener('end', function() {
    //
    // Serve files!
    //
    clientFiles.serve(request, response, function(err, res) {
      if (err) { // An error as occured
        console.log("> Error serving " + request.url + " - " + err.message)
        response.writeHead(err.status, err.headers);
        response.end()
      }
      else { // The file was served successfully
        console.log("> " + request.url + " - " + res.message)
      }
    })
  })
}
