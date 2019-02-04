const cylon = require('cylon');
const shell = require('shelljs');
const parallel = require('run-parallel');
const ffmpeg = require('fluent-ffmpeg');
const { fork } = require('child_process');

const duration = 20000; // 20 seconds?
const storagePath = __dirname; // find path to USB somehow
shell.cd(__dirname);

// State object to track system states.
const State = {
  onAir: false, // Are we recording?
};

// render a png over the preview
const renderOverlay = (callback) => {
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
      shell.exec('python3 ./preview.py', {
        async: true,
      });

      my.button.on('push', () => {
        if (!State.onAir) {
          State.onAir = true; // We are recording, don't try starting again.
          const date = new Date();
          const stamp = `UseYourWords_${date.getUTCFullYear()}${date.getUTCMonth()
            + 1}${date.getDate()}${date.getHours()}${date.getMinutes()}`;

          const filepath = `${storagePath}/${stamp}/${stamp}`;
          shell.mkdir(`${storagePath}/${stamp}`);

          console.log(`Initializing Recording Process For ${stamp}`);
          // if this isn't parallel enough mic and cam functions can be separated into
          // separate module files and forked via subprocess
          parallel(
            [
              (callback) => {
                const camProcess = fork('./functions/cam.js');
                console.log('Forked Cam');
                camProcess.send({ filepath, duration });
                camProcess.on('message', ({ err, result }) => {
                  console.log('Received end message from Cam');
                  callback(err, result);
                });
              },
              (callback) => {
                const micProcess = fork('./functions/mic.js');
                console.log('Forked Mic');
                micProcess.send({ filepath, duration });
                micProcess.on('message', ({ err, result }) => {
                  console.log('Received end message from Mic');
                  callback(err, result);
                });
              },
              (callback) => {
                renderOverlay(callback);
              },
            ],
            async (err, result) => {
              if (err) console.error(`Woops, Something Went Wrong: ${err}`);
              else {
                console.log(result);
                console.log('Beginning Composite Process...');
                // try to composite the video and audio into the same file.
                try {
                  await ffmpeg(`${filepath}.h264`)
                    .on('error', (ffmpegError) => {
                      console.log(`Audio + Video Compositing Failed: ${ffmpegError.message}`);
                    })
                    .on('end', () => console.log('Audio + Video Compositing Finished'))
                    .on('progress', (progress) => {
                      console.log(`Processing: ${progress}% done`);
                    })
                    .save(`${filepath}.mp4`);
                } catch (error) {
                  console.log(`MERGE FAILED: ${error}`);
                }
              }
              State.onAir = false; // We're all done recording, for better or worse.
            },
          );
        }
      });
    },
  })
  .start();
