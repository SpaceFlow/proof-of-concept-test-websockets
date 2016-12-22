var WebSocketServer = require('websocket').server;
var http = require('http');
var connections = [];
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.write("fuck");
    response.end();
});
server.listen(1337, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});
 
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production 
    // applications, as it defeats all standard cross-origin protection 
    // facilities built into the protocol and the browser.  You should 
    // *always* verify the connection's origin and decide whether or not 
    // to accept it. 
    autoAcceptConnections: false
});
 
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed. 
  return true;
}
 
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin 
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connections.forEach(function(currentWS) {
              parseSFMessage(message.utf8Data, function(parsedMessage) {

                currentWS.send(parsedMessage)
              })
            })
        }
        else if (message.type === 'binary') {
            console.log("pls set to utf8 kthxbye");
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
function parseSFMessage(message, cb) {
    var parsedMessage = JSON.parse(message);
    if (parsedMessage.msg_type == "status") {

      parsedMessage.payload.timestamp = new Date();
      cb(JSON.stringify(cb))
    }

}