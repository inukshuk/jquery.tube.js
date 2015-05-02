require 'json'
require 'uglifier'

VERSION = '0.2.7'

LICENSE = <<-END
/*! jquery.tube.js #{VERSION} | https://github.com/inukshuk/jquery.tube.js/blob/master/LICENSE */
END

FULL_LICENSE = <<-END
/*!
 * jquery.tube.js #{VERSION}
 * Copyright (c) #{Time.now.year} Sylvester Keil, Thomas Egger.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

END

def normalize(text, tab = '  ', indent = 1)
  text.gsub(/^if\s*\(exports\).*/m, '').gsub(/\t/, tab).gsub(/^/, tab * indent)
end

task :build do
  File.open('jquery.tube.js', 'w') do |f|
    f.puts FULL_LICENSE
    f.puts "(function ($, window, document, version, undefined) {\n  'use strict';"
    f.puts normalize(File.open('./src/common.js', 'r:UTF-8').read)
    f.puts normalize(File.open('./src/video.js', 'r:UTF-8').read)
    f.puts normalize(File.open('./src/tube.js', 'r:UTF-8').read)
    f.puts normalize(File.open('./src/player.js', 'r:UTF-8').read)
    f.puts normalize(File.open('./src/plugin.js', 'r:UTF-8').read)
    f.puts "}(jQuery, window, window.document, '#{VERSION}'));"
  end
end

task :minify => [:build] do
  File.open('jquery.tube.min.js', 'w') do |f|
    f.puts LICENSE
    f.puts Uglifier.new(:copyright => false).compile(File.open('jquery.tube.js', 'r:UTF-8').read)
  end
end
