test:
	mocha --require should --require jsdom --require jquery --reporter dot test/runner.js

spec:
	mocha --require should --require jsdom --require jquery --reporter spec test/runner.js

.PHONY: test spec