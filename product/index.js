
const { get, post } = require('./handler')

const product = async event =>{

	switch (event.httpMethod) {
	case 'GET':
		return get(event.queryStringParameters)
		// 	break
	case 'POST':
		return post(event)
		// 	break
		// case 'DELETE':
		// 	break
		// case 'OPTIONS':
		// 	break
		// default:
		// 	break
	}

}

module.exports = { product }