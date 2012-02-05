test:
	mocha test/runner.js

spec:
	mocha -R spec test/runner.js

.PHONY: test spec