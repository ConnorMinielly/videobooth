const Picam = require('pi-camera');
// setup camera with recording duration.
const setupCam = (dur) => {
  const cam = new Picam({
    mode: 'video',
    output: 'video.h264', // Temporary name
    width: 1920,
    height: 1080,
    timeout: dur, // Record for 5 seconds
    nopreview: false, // show preview
  });
  return cam;
};

// fire up the PiCamera and record video to the designated filepath.
const startPiCam = (filepath, cam) => {
  cam.set('output', `${filepath}.h264`);
  cam
    .record()
    .then(() => {
      process.send({ err: null, result: 'Video: SUCCEEDED' });
    })
    .catch((err) => {
      process.send({ err, result: 'Video: FAILED' });
    });
};

process.on('message', ({ fp, dur }) => {
  startPiCam(fp, setupCam(dur));
});
