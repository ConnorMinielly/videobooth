const cylon = require('cylon');

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
        console.log('Button pushed');
      });
    },
  })
  .start();
