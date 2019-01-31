const Micro = require('mic');
const fs = require('fs');
// Init mic object for recording audio
const mic = new Micro({
  rate: '1600',
  channels: '1',
  device: 'hw:1,0',
  filetype: 'wav',
});

// fire up the mic and record audio to the designated filepath.
const startPiMic = async (filepath, duration) => {
  const audioInStream = mic.getAudioStream();
  const fileOutStream = fs.createWriteStream(`${filepath}.wav`);
  // Add event listener that starts timeout counter as soon as the
  // start() function is successfully called
  audioInStream.on('startComplete', () => {
    setTimeout(() => {
      mic.stop();
    }, duration);
  });

  audioInStream.on('stopComplete', () => {
    process.send({ err: null, result: 'Audio: SUCCEEDED' });
  });
  audioInStream.pipe(fileOutStream);

  try {
    await mic.start();
  } catch (err) {
    process.send({ err, result: 'Audio: FAILED' });
  }
};

process.on('message', ({ filepath, duration }) => {
  startPiMic(filepath, duration);
});
