/*globals describe: true, it: true, Tube: true, Video: true, beforeEach: true, before: true, after: true, done: true */

describe('Tube', function () {
  'use strict';

  describe('Constructor', function () {
    it('returns a tube object', function () {
      var tube = new Tube();

      // this is rather permissive; just a few important properties
      tube.should.haveOwnProperty('options');
    });
  });

  describe('.serialize', function () {

    it('returns an empty string by default', function () {
      Tube.serialize().should.equal('');
      Tube.serialize(null).should.equal('');
    });

    describe('when passed a string', function () {
      it('returns an empty string for ""', function () {
        Tube.serialize('').should.equal('');
      });

      it('returns the string uri encoded', function () {
        Tube.serialize('foo').should.equal('foo');
        Tube.serialize('foo bar').should.equal('foo%20bar');
      });
    });

    describe('when passed an array', function () {
      it('returns an empty string for []', function () {
        Tube.serialize([]).should.equal('');
      });

      it('returns all items uri encoded and joined with "&"', function () {
        Tube.serialize(['foo']).should.equal('0=foo');
        Tube.serialize(['foo', 'foo bar']).should.equal('0=foo&1=foo%20bar');
      });
    });

    describe('when passed an object', function () {
      it('returns an empty string for {}', function () {
        Tube.serialize({}).should.equal('');
      });

      it('returns all items uri encoded and joined with "&"', function () {
        Tube.serialize({ foo: 'bar' }).should.equal('foo=bar');
        Tube.serialize({ foo: 'bar', bar: 'foo bar'}).should.equal('foo=bar&bar=foo%20bar');
      });

      it('filters null values', function () {
        Tube.serialize({ foo: null }).should.equal('');
        Tube.serialize({ foo: null, bar: 'bar' }).should.equal('bar=bar');
      });

      it('filters empty values', function () {
        Tube.serialize({ foo: '' }).should.equal('');
        Tube.serialize({ foo: '', bar: 'bar', x: undefined }).should.equal('bar=bar');
      });

    });
  });

  describe('instance methods', function () {
    var tube;

    beforeEach(function () {
      tube = new Tube();
    });

		describe('templates are unique across instances', function () {
			var t1 = new Tube({ templates: { description: 'FOO' }});
			var t2 = new Tube({ templates: { description: 'BAR' }});
			
			t1.options.templates.description.should.equal('FOO');
			t2.options.templates.description.should.equal('BAR');
		});

    describe('#parameters', function () {
      it('returns the default options by default', function () {
        var parameters = tube.parameters();

        parameters.should.not.have.property('key');

        parameters.should.have.property('format');
        parameters.should.have.property('orderby');
        parameters.should.have.property('alt');
        parameters.should.have.property('callback', '?');
      });

      it('includes the key if set in the options', function () {
        tube.options.key = 'THEKEY';
        tube.parameters().should.have.property('key', 'THEKEY');
      });

      // it("passed in values override the tube's options", function () {
      //   tube.parameters({ format: 'OVERRIDE' }).format.should.not.equal(tube.parameters.format);
      // });

      it('never overrides the callback parameter', function () {
        tube.parameters({ callback: 'OVERRIDE' }).should.have.property('callback', '?');
      });

      it('ignores unknown parameter options', function () {
        tube.parameters({ foo: 'bar' }).should.not.have.property('foo');
      });
    });

    describe('#request', function () {
      it('returns a string', function () {
        tube.request().should.be.a('string');
      });

      it('returns an http url with options', function () {
        tube.request().should.match(/^\/\/\S+\/?[\w\d%&?=\-]+$/);
      });
    });

    // NB: The examples below are commented out because we have no mock objects
    // to test the YouTube API and we don't want to query Google's servers
    // every time we run the tests. Turn them on if you want to specifically
    // test loading functionality.
    describe('#load', function () {
      it('returns the tube object (without blocking)', function () {
        tube.load().should.equal(tube);
      });

      // it('executes an (optional) callback when the gdata request returns', function (done) {
      //   tube.load(done);
      // });

      // it('the (optional) callback is applied to the tube object', function (done) {
      //   tube.load(function () {
      //     this.should.equal(tube);
      //     done();
      //   });
      // });

      describe('when the query was successful', function () {
        before(function () {
          tube.options.query = 'foobar';
        });

        after(function () {
          tube.options.query = null;
        });

        // it('the tube contains feed entries', function (data) {
        //   tube.load(function () {
        //     this.videos.should.not.be.empty;
        //     done();
        //   });
        // });

        // it('the callback is called with a status: true', function (data) {
        //   tube.load(function (status) {
        //     status.should.be(true);
        //     done();
        //   });
        // });
      });

      describe('when the query is a custom list', function () {
        before(function () {
          tube.options.list = ['lVQ1EKR1v1I', 'ylLzyHk54Z0', 'sOEAD-gfJ_M'];
        });

        after(function () {
          delete tube.options.list;
        });

        // it('the tube contains all requested videos', function (data) {
        //   tube.load(function () {
        //     this.videos.length.should.equal(3);
        //     this.videos[2].should.have.property('author');
        //     this.videso[2].author.name.should.match(/google/i);
        //     done();
        //   });
        // });

      });
    });

    describe('#html', function () {
      it('returns an empty list by default', function () {
        tube.render().should.equal('<ol></ol>');
      });

      describe('when there are videos in the tube', function () {
        beforeEach(function () {
          tube.videos.push(new Video({ title: 'A Video' }));
          tube.videos.push(new Video({ title: 'Another Video' }));
        });
      });
    });

  });

});
