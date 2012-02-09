window = require('jsdom').jsdom().createWindow();
jQuery = $ = require('jquery');

Video  = require('../src/video.js').Video;
Tube   = require('../src/tube.js').Tube;
Player = require('../src/player.js').Player;

require('../src/plugin.js');

require('./test.video.js');
require('./test.tube.js');
require('./test.player.js');
require('./test.plugin.js');
