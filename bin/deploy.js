const Deployer = require('./lib/deployer');

Deployer.create(process.argv).deploy().then(() => console.log('finish'));
