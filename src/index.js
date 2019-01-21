// Alternative to johnny-five I could use Cylon.js instead.
const Cylon = require('cylon');

Cylon.robot({
  connections: {
    raspi: { adaptor: 'raspi' },
  },

  devices: {
    led: { driver: 'led', pin: 11 },
  },

  work: my => {
    every((1).second(), my.led.toggle);
  },
}).start();
