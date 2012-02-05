window = require('jsdom').jsdom().createWindow();
jQuery = $ = require('jquery');

require('../src/jquery.tube.js');

require('./test.tube.js');
require('./test.player.js');
require('./test.plugin.js');
