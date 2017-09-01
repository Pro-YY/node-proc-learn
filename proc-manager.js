const { fork, spawn } = require('child_process');

console.log('manager start: [pid]' + process.pid);

var worker;

function s() {
  /*
   * fork is just a special case of spawn, spawn only Node.js process with module path
   * unlike fork in posix system call, no clone
   */
  // worker = spawn(process.argv[0], ['./proc-worker'], {stdio: ['pipe', 'pipe', 'pipe', 'ipc']});
  // worker = fork('./proc-worker', [], {stdio: ['inherit', 'inherit', 'inherit', 'ipc']});
  worker = fork('./proc-worker', [], {stdio: ['pipe', 'pipe', 'pipe', 'ipc']});

  worker.stdout.on('data', (data) => {
    process.stdout.write(`[C] ${data}`);
  });

  worker.stderr.on('data', (data) => {
    process.stderr.write(`[C] ${data}`);
  });

  worker.on('message', (data) => {
    console.log(`[P] recv msg from child: ${data}`);
    worker.send('PONG!');
  });

  //worker.on('close', (code) => {    // NOTE: cannot got close event when disconnected
  worker.on('exit', (code) => {
    console.log(`[P] child process exited with code ${code}, respawning...`);
    s();
  });

  // disconnected in 5 seconds
  setTimeout(() => {
    console.log('[P] disconnecting child...');
    worker.disconnect();
  }, 5000);

}

// command: kill -s USR2 $PID
process.on('SIGUSR2', () => {
  console.log('recv SIGUSR2, killing child...');
  process.kill(worker.pid);
});

s();
