const five = require('johnny-five');

// For some god forsaken reason you can only install raspi-io while on ARM architecture and I don't
// want to write all this on a Pi so the following needs to be un-commented once setup on the Pi its gonna run on.
// obviously this means I need to remember to 'yarn add raspi-io' as well.

// const Raspi = require("raspi-io");
// const board = new five.Board({
//   io: new Raspi()
// });

const board = new five.Board();

board.on('ready', () => {
  // set up an led attached to pin 13
  let led = new five.Led(13);
  led.blink(500);
});
