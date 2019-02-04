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
const startPiCam = async (filepath, duration) => {
  shell.exec(
    `sudo raspivid -o ${filepath}.h264 -t ${duration} -f -w 1920 -h 1080 -fps 24`,
    (code, stdout, stderr) => {
      console.log(`EXIT CODE: ${code} - STDOUT: ${stdout}`);
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
