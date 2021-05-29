
const { ok } = require('./response')

const handler = async event => {
	if (event.httpMethod === 'OPTIONS') {
		return ok
	}
}

module.exports = {
	handler
}