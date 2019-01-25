// this can (probably) be used to setup the raspidmx repo that i'm using to render the overlay.
// execute using `yarn build-raspidmx'

const shell = require('shelljs');

const Setup = async () => {
  if (shell.which('git') && shell.which('make')) {
    shell.cd(__dirname);
    console.log('cloning raspidmx...');
    await shell.exec(
      'git clone https://github.com/AndrewFromMelbourne/raspidmx.git',
      { silent: true },
    );
    shell.cd('raspidmx');
    console.log('making raspidmx...');
    await shell.exec('sudo make', { silent: true });
    console.log('exporting lib...');
    await shell.exec('export LD_LIBRARY_PATH=$(pwd)/lib', { silent: true });
  } else console.error('Build requires git and make installed on system.');
};

Setup();
