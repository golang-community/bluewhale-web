const cluster = require('cluster');
// const numCpus = require('os').cpus().length;
// 仅仅是想用cluster模式启动，但只启用一个线程
const numCpus = 1;

if (cluster.isMaster) {
  let i = 0;
  while (i < numCpus) {
    cluster.fork();
    i++;
  }
  cluster.on('exit', (worker, code, signal) => {
    console.error(`worker ${worker.id}(pid = ${worker.process.pid}) is dead`);
    // 重新fork一份
    cluster.fork();
  });
} else {
  require('./index');
}
