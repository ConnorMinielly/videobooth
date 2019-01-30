const cylon = require('cylon');
const shell = require('shelljs');
const async = require('async');
const picam = require('pi-camera');
const micro = require('mic');
const fffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

const duration = 20000; // 20 seconds?
const storagePath = __dirname; // find path to USB somehow

// Init cam object for recording video
const cam = new picam({
  mode: 'video',
  output: `video.h264`, // Temporary name
  width: 1920,
  height: 1080,
  timeout: duration, // Record for 5 seconds
  nopreview: false, // show preview
});

// Init mic object for recording audio
const mic = new micro({
  rate: '1600',
  channels: '1',
  device: 'hw:1,0',
  filetype: 'wav',
});

// Init ffmpeg object to handle video and audio merge/conversion.
const ffmpeg = new fffmpeg();

// Add event listener that starts timeout counter as soon as the start() function is successfully called
mic.on('startComplete', () => {
  setTimeout(() => {
    mic.stop();
  }, duration);
});

// State object to track system states.
const State = {
  onAir: false, // Are we recording?
};

// Spin up cylon connection to RPI to manage GPIO button triggers
cylon
  .robot({
    connections: {
      raspi: { adaptor: 'raspi' },
    },

    // define start button
    devices: {
      button: { driver: 'button', pin: 2 },
    },

    work: devices => {
      devices.button.on('push', () => {
        if (!State.onAir) {
          State.onAir = true; // We are recording, don't try starting again.
          let date = Date.now();
          let stamp = `UseYourWords_${date.getUTCFullYear()}${date.getUTCMonth() +
            1}${date.getDate()}${date.getHours()}${date.getMinutes()}`;
          let filepath = `${storagePath}/${stamp}/${stamp}`;

          console.log('Initializing Recording Process For ' + stamp);
          // if this isn't parallel enough mic and cam functions can be separated into separate module files and forked via subprocess
          async.parallel(
            [renderOverlay(), startPiCam(filepath), startPiMic(filepath)],
            async err => {
              if (err) console.error('Woops, Something Went Wrong: ' + err);
              else {
                console.log('Beginning Composite Process...');
                // try to composite the video and audio into the same file.
                await ffmpeg
                  .input(filepath + '.h264')
                  .input(filepath + '.wav')
                  .output(filepath + 'mp4')
                  .on('end', () =>
                    console.log('Audio + Video Compositing Finished'),
                  )
                  .run();
                console.log('Removing Source Audio (wav) + Video (h264) Files');
                fs.unlink(filepath + '.h264');
                fs.unlink(filepath + '.wav');
              }
              State.onAir = false; // We're all done recording, for better or worse.
            },
          );
        }
      });
    },
  })
  .start();

// render a png over the preview
renderOverlay = () => {
  shell.cd(__dirname);
  shell.exec(
    `./raspidmx/pngview/pngview -b 0 -l 3 -t ${duration} -n overlay.png`,
    {},
    (code, stout, sterr) => {
      sterr && console.log(`Overlay Execution Error: ${sterr}`);
    },
  );
};

// fire up the PiCamera and record video to the designated filepath.
startPiCam = (filepath, callback) => {
  cam.set('output', filepath + '.h264');
  cam.record(() => callback());
};

// fire up the mic and record audio to the designated filepath.
startPiMic = async (filepath, callback) => {
  let audioInStream = mic.getAudioStream();
  let fileOutStream = fs.WriteStream(filepath + '.wav');
  audioInStream.pipe(fileOutStream);
  await mic.start();
  callback();
};
