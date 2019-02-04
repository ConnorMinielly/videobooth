const shell = require('shelljs');

// fire up the mic and record audio to the designated filepath.
const startPiMic = async (filepath, duration) => {
  // going back to the arecord direct command call
  shell.exec(
    `sudo arecord --device=hw:1,0 -f dat -c1 -d ${duration / 1000} ${filepath}.wav`,
    (code, stdout, stderr) => {
      if (stderr) {
        process.send({ err: stderr, result: 'Audio: FAILED' });
      } else {
        process.send({ err: null, result: 'Audio: SUCCEEDED' });
      }
    },
  );
};

process.on('message', ({ filepath, duration }) => {
  startPiMic(filepath, duration);
});
