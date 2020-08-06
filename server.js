const {Server} = require('net');
const fs = require('fs');

const Request = require('./lib/request');
const {processRequest} = require('./app');

const handleConnection = function (socket) {
  const remote = {addr: socket.remoteAddress, port: socket.remotePort};
  console.warn('New Connection: ', remote);

  socket.setEncoding('utf8');

  socket.on('close', (hadError) => {
    console.warn(remote, 'closed', `${hadError ? 'with error.' : ''}`)
  });

  socket.on('end', () => console.warn(remote, 'ended'));

  socket.on('error', (error) => console.error(`Socket Error ${error}`));

  socket.on('data', (text) => {
    const req = Request.createFrom(text);
    const res = processRequest(req);
    res.writeTo(socket);
  });
};

const main = function () {
  const server = new Server();

  server.on('error', err => console.error('server error', err));
  server.on('connection', handleConnection);
  server.on('listening', () => console.warn('Stared Listening', server.address()));

  server.listen(4000);
};

main();