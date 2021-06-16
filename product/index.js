
const { get, post, delete_r } = require('./handler')
const { ok, badRequest } = require('../response')

const product = async (event, context) =>{

	context.callbackWaitsForEmptyEventLoop = false

	switch (event.httpMethod) {
	case 'GET':
		return await get(event.queryStringParameters)
	case 'POST':
		return await post(event)
	case 'DELETE':
		return await delete_r(event.queryStringParameters)
	case 'OPTIONS':
		return ok()
	default:
		return badRequest()
	}

}

module.exports = { product }