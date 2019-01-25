// Alternative to johnny-five, I could use Cylon.js instead.
const Cylon = require('cylon');
const shell = require('shelljs');

shell.exec(
  './pngview -b 0 -l 3 -t 1000 overlay.png',
  {},
  (code, stout, sterr) => {
    sterr && console.log(`Execution Error: ${sterr}`);
  },
);

// Cylon.robot({
//   connections: {
//     raspi: { adaptor: 'raspi' },
//   },

//   devices: {
//     led: { driver: 'led', pin: 11 },
//   },

//   work: my => {
//     every((1).second(), my.led.toggle);
//   },
// }).start();
