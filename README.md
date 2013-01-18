jquery.tube.js
==============

[![Build Status](https://secure.travis-ci.org/inukshuk/jquery.tube.js.png)](http://travis-ci.org/inukshuk/jquery.tube.js)

Tube is a jQuery plugin to access YouTube's player and data APIs
transparently. The basic approach is centered around 'tube' objects: a
tube is an abstract container filled with videos based on a YouTube
playlist, user's feed or a search query; a tube offers the basic control and
event handling interfaces you would expect from a playlist (play, pause, next,
etc.) and is associated with a player instance. A player is a thin wrapper
around YouTube's iFrame or (if window.pushMessage is unavailable) JavaScript
player API; thus, the player is intended to work transparently on legacy
browsers (IE7) and modern HTML5 capable devices without Flash support.

This plugin contains no stylesheets; tube instances create simple HTML
lists of their contents (the structure can be adjusted for each instance
through a simple template system).

Installation
------------
Simply grab `jquery.tube.js` or `jquery.tube.min.js` from the project's
root directory. For [bower](http://twitter.github.com/bower/) users simply
run:

    $ bower install jquery.tube

Or add "jquery.tube" as a dependency to your `component.json` file.

Documentation
-------------
For the time being, consult the examples in the `demo` and `test`
directories.


Development
-----------
This plugin uses the awesome [mocha](https://github.com/visionmedia/mocha)
framework for testing; in order to run the tests you need to install a
few libraries through npm:

    $ npm install
    $ npm test

If you customize any of Tube's components, you can build a new version of
the plugin as follows:

    $ bundle install
    $ rake build minify

License
-------
(The MIT License)

Copyright (c) 2012-2013 Sylvester Keil, Thomas Egger.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
