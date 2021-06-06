const { defaults } = require('jest-config')
module.exports = {
	...defaults,
	testMatch: [
		'<rootDir>**/*.(spec|test).[jt]s?(x)'
	],
	collectCoverageFrom: [
		'**/*.{js,jsx}',
		'!**/node_modules/**'
	],
	coverageReporters: ['json', 'lcov', 'text', 'clover']
}