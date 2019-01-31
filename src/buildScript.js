// this can (probably) be used to setup the raspidmx repo that i'm using to render the overlay.
// execute using `yarn build-raspidmx'

const shell = require('shelljs');

const Setup = async () => {
  if (shell.which('git') && shell.which('make')) {
    shell.cd(__dirname);
    console.log('cloning raspidmx...');
    if (shell.test('-e', './raspidmx')) {
      await shell.rm('-r', './raspidmx');
    }
    await shell.exec('git clone https://github.com/AndrewFromMelbourne/raspidmx.git');
    shell.cd('raspidmx');
    console.log('making raspidmx...');
    await shell.exec('sudo make');
    console.log('copying lib file...');
    await shell.exec('sudo cp ./lib/libraspidmx.so.1 /usr/lib');
  } else console.error('Build requires git and make installed on system.');
};

Setup();
