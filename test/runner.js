window = require('jsdom').jsdom().createWindow();
jQuery = $ = require('jquery');

Tube = require('../src/tube.js').Tube;
Player = require('../src/player.js').Player;
require('../src/plugin.js');

require('./test.tube.js');
require('./test.player.js');
require('./test.plugin.js');
