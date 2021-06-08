const { get, post, delete_r, put } = require('./handler')
const { ok, badRequest } = require('../response')

const terminal = async event =>{

	switch (event.httpMethod) {
	case 'GET':
		return await get(event.queryStringParameters)
	case 'POST':
		return await post(event)
	case 'PUT':
		return await put(event)
	case 'DELETE':
		return await delete_r(event.queryStringParameters)
	case 'OPTIONS':
		return ok()
	default:
		console.log(event)
		return badRequest()
	}

}

module.exports = { terminal }