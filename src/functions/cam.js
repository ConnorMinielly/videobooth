// const Picam = require('pi-camera');
const shell = require('shelljs');
// // setup camera with recording duration.
// const setupCam = (dur) => {
//   console.log(`duration: ${dur}`);
//   const cam = new Picam({
//     mode: 'video',
//     output: 'video.h264', // Temporary name
//     width: 1920,
//     height: 1080,
//     timeout: dur, // Record for 5 seconds
//     nopreview: false, // show preview
//   });
//   return cam;
// };

// fire up the PiCamera and record video to the designated filepath.
const startPiCam = (filepath, duration) => {
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

process.on('message', ({ filepath, duration }) => {
  console.log('Trying Cam Start');
  startPiCam(filepath, duration);
});
