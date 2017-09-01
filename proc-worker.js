
console.log('worker start, hot reload supported: [pid]' + process.pid);
console.log('process.channel:');
console.log(process.channel);
console.log(`env.VAR: ${process.env.VAR}`);   // inherit env from parent

process.on('message', (data) => {
  console.log(`child recv msg from parent: ${data}`);
});
process.on('disconnect', () => {
  console.log('child disconnected from parent.');
});

// ping parent in each second
setInterval(() => {
  if (process.connected) {
    process.send('Hello master, worker alive! PING!', (err) => {
      if (err) console.log(err);
    });
  }
}, 1000);

// run for 10 seconds
setInterval(() => {
  process.exit(0);
}, 10000);
