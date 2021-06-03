
const { get, post, delete_r } = require('./handler')

const product = async event =>{

	switch (event.httpMethod) {
	case 'GET':
		return await get(event.queryStringParameters)
		// 	break
	case 'POST':
		return await post(event)
		// 	break
	case 'DELETE':
		return await delete_r(event.queryStringParameters)
		// 	break
		// case 'OPTIONS':
		// 	break
		// default:
		// 	break
	}

}

module.exports = { product }