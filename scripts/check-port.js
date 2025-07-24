// Node.js script to check if a port is in use and print a warning or exit
const net = require('net');

const port = process.argv[2];
if (!port) {
  console.error('Usage: node scripts/check-port.js <port>');
  process.exit(1);
}

const server = net.createServer();
server.once('error', function(err) {
  if (err.code === 'EADDRINUSE') {
    console.error(`\x1b[31mPort ${port} is already in use. Tests may fail or kill an existing process.\x1b[0m`);
    process.exit(2);
  } else {
    throw err;
  }
});
server.once('listening', function() {
  server.close();
  process.exit(0);
});
server.listen(port, '127.0.0.1');