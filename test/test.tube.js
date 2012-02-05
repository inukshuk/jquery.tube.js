describe('Tube', function () {
  var Tube = $.tube.Tube;
  
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
      
      it("passed in values override the tube's options", function () {
        tube.parameters({ format: 'OVERRIDE' }).format.should.not.equal(tube.parameters.format);
      });

      it('the callback parameter is never overridden', function () {
        tube.parameters({ callback: 'OVERRIDE' }).should.have.property('callback', '?');
      });
      
      it('unknown parameter options are ignored', function () {
        tube.parameters({ foo: 'bar' }).should.not.have.property('foo');
      });
    });
    
    describe('#request', function () {
      // it('returns');
    });
  });
  
});
