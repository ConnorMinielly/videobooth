const cylon = require('cylon');
const shell = require('shelljs');
const parallel = require('run-parallel');
const Fffmpeg = require('fluent-ffmpeg');
const { fork } = require('child_process');
const fs = require('fs');

const duration = 20000; // 20 seconds?
const storagePath = __dirname; // find path to USB somehow

// Init ffmpeg object to handle video and audio merge/conversion.
const ffmpeg = new Fffmpeg();

// State object to track system states.
const State = {
  onAir: false, // Are we recording?
};

// render a png over the preview
const renderOverlay = (callback) => {
  shell.cd(__dirname);
  shell.exec(
    `./raspidmx/pngview/pngview -b 0 -l 3 -t ${duration} -n overlay.png`,
    {},
    (code, stout, sterr) => {
      if (sterr) {
        console.log(`Overlay Execution Error: ${sterr}`);
      } else {
        console.log(code);
      }
    },
  );
  callback();
};

// Spin up cylon connection to RPI to manage GPIO button triggers
cylon
  .robot({
    connections: {
      raspi: { adaptor: 'raspi' },
    },

    // define start button
    devices: {
      button: { driver: 'button', pin: 3 },
    },

    work: (my) => {
      my.button.on('push', () => {
        if (!State.onAir) {
          State.onAir = true; // We are recording, don't try starting again.
          const date = new Date();
          const stamp = `UseYourWords_${date.getUTCFullYear()}${date.getUTCMonth()
            + 1}${date.getDate()}${date.getHours()}${date.getMinutes()}`;

          const filepath = `${storagePath}/${stamp}/${stamp}`;

          console.log(`Initializing Recording Process For ${stamp}`);
          // if this isn't parallel enough mic and cam functions can be separated into
          // separate module files and forked via subprocess
          parallel(
            [
              (callback) => {
                renderOverlay(callback);
              },
              (callback) => {
                const camProcess = fork('functions/cam.js');
                camProcess.send({ filepath, duration });
                camProcess.on('message', ({ err, result }) => {
                  callback(err, result);
                });
              },
              (callback) => {
                const micProcess = fork('functions/mic.js');
                micProcess.send({ filepath, duration });
                micProcess.on('message', ({ err, result }) => {
                  callback(err, result);
                });
              },
            ],
            async (err) => {
              if (err) console.error(`Woops, Something Went Wrong: ${err}`);
              else {
                console.log('Beginning Composite Process...');
                // try to composite the video and audio into the same file.
                await ffmpeg
                  .input(`${filepath}.h264`)
                  .input(`${filepath}.wav`)
                  .output(`${filepath}mp4`)
                  .on('end', () => console.log('Audio + Video Compositing Finished'))
                  .run();
                console.log('Removing Source Audio (wav) + Video (h264) Files');
                fs.unlink(`${filepath}.h264`);
                fs.unlink(`${filepath}.wav`);
              }
              State.onAir = false; // We're all done recording, for better or worse.
            },
          );
        }
      });
    },
  })
  .start();
