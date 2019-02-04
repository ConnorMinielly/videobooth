// const Picam = require('pi-camera');
const shell = require('shelljs');

// fire up the PiCamera and record video to the designated filepath.
const startPiCam = async (filepath, duration) => {
  shell.exec(
    `sudo raspivid -o ${filepath}.h264 -t ${duration} -f -w 1920 -h 1080 -fps 24`,
    (code, stdout, stderr) => {
      if (stderr) {
        process.send({ err: stderr, result: 'Video: FAILED' });
      } else {
        process.send({ err: null, result: 'Video: SUCCEEDED' });
      }
    },
  );
};

process.on('message', async ({ filepath, duration }) => {
  console.log('Trying Cam Start');
  await startPiCam(filepath, duration);
});
