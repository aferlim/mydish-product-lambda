const AWS = require('aws-sdk')
const { product } = require('./index')

const { badRequest, ok, badRequestWithMessage, notFound } = require('../response')

jest.mock('aws-sdk', () => {

	const mDocumentClient = { 
		get: jest.fn().mockImplementation(() => {
			return {
				promise() {
					return Promise.resolve({id: '1' })
				}
			}
		}),
		scan: jest.fn().mockImplementation(() => {
			return {
				promise() {
					return Promise.resolve([ {id: '1' } ])
				}
			}
		}), 
		query: jest.fn().mockImplementation(() => {
			return {
				promise() {
					return Promise.resolve([ {id: '1' } ])
				}
			}
		}), 
		put: jest.fn().mockImplementation(() => {
			return {
				promise() {
					return Promise.resolve([ {id: '1' } ])
				}
			}
		}), 
		update: jest.fn().mockImplementation(() => {
			return {
				promise() {
					return Promise.resolve([ {id: '1' } ])
				}
			}
		}), 
		delete: jest.fn().mockImplementation(() => {
			return {
				promise() {
					return Promise.resolve(true)
				}
			}
		})
	}
	const mDynamoDB = { DocumentClient: jest.fn(() => mDocumentClient) }
	return { DynamoDB: mDynamoDB }
})

const mDynamoDb = new AWS.DynamoDB.DocumentClient()

describe('Product Suite', () => {

	beforeAll(() => { console.log = jest.fn() })

	afterAll(() => {
		jest.resetAllMocks()
	})

	test('Should_returns_notfound_invalid_get', async () => {
		const request = { httpMethod: 'GET', queryStringParameters: null }

		let result = await product(request)

		expect(result.statusCode).toBe(404)
	})

	test('Should_returns_ok_all_products', async () => {

		const request = { httpMethod: 'GET', queryStringParameters: {type: 'all'} }

		let result = await product(request)

		expect(result.statusCode === 200).toBeTruthy()
	})

	test('Should_returns_a_badrequest_dynamo_error_all_products', async () => {

		mDynamoDb.scan.mockReturnValue(null)

		const request = { httpMethod: 'GET', queryStringParameters: {type: 'all'} }

		let result = await product(request)

		expect(result).toStrictEqual(badRequest())
		expect(result.statusCode).toBe(400)
	})

	test('Should_returns_ok_one_by_external', async () => {

		const request = { httpMethod: 'GET', queryStringParameters: { terminal_id: 2, extern_id: 2 } }

		let result = await product(request)

		let should = ok({id: '1' })

		expect(result).toStrictEqual(should)
		expect(result.statusCode).toBe(200)
	})

	test('Should_returns_a_badrequest_dynamo_error_one_by_external', async () => {

		mDynamoDb.get.mockReturnValue(null)

		const request = { httpMethod: 'GET', queryStringParameters: { terminal_id: 2, extern_id: 2 } }

		let result = await product(request)

		expect(result).toStrictEqual(badRequest())
		expect(result.statusCode).toBe(400)
	})

	test('Should_returns_notfoud_one_by_external', async () => {

		mDynamoDb.get = jest.fn().mockImplementation(() => ({ promise: () => (Promise.resolve({})) }))

		const request = { httpMethod: 'GET', queryStringParameters: { terminal_id: 2, extern_id: 2 } }

		let result = await product(request)

		expect(result.statusCode).toBe(404)
	})

	test('Should_returns_ok_one_by_terminal', async () => {

		const request = { httpMethod: 'GET', queryStringParameters: { terminal_id: 2 } }

		let result = await product(request)

		let should = ok([ {id: '1' } ])

		expect(result).toStrictEqual(should)
		expect(result.statusCode).toBe(200)
	})

	test('Should_returns_a_badrequest_dynamo_error_one_by_terminal', async () => {

		mDynamoDb.query.mockReturnValue(null)

		const request = { httpMethod: 'GET', queryStringParameters: { terminal_id: 2 } }

		let result = await product(request)

		expect(result).toStrictEqual(badRequest())
		expect(result.statusCode).toBe(400)
	})

	test('Should_returns_a_badrequest_post_invalid_request_array', async () => {

		const request = { httpMethod: 'POST', queryStringParameters: { terminal_id: '222' }, body: JSON.stringify({}) }

		let result = await product(request)

		expect(result).toStrictEqual(badRequestWithMessage({ error: 'missing/wrong parameters'}))
		expect(result.statusCode).toBe(400)
	})

	test('Should_returns_a_badrequest_post_invalid_request_terminal_id', async () => {

		const request = { httpMethod: 'POST', queryStringParameters: { x: '222' }, body: JSON.stringify([ {
			terminal_id: '3333',
			extern_id: '3333',
			stock: 4,
			price: 89,
			name: 'Pizza 4 Queijos'
		}]) }

		let result = await product(request)

		expect(result).toStrictEqual(badRequestWithMessage({ error: 'missing/wrong parameters'}))
		expect(result.statusCode).toBe(400)
	})

	test('Should_returns_a_badrequest_post_invalid_validation_all_errors', async () => {

		let arr = [ {
			id: '3333',
			stock: 4,
			price: 89,
			_name: 'Pizza 4 Queijos'
		},{
			id: '4444',
			stock: 4,
			price: 89,
			_name: 'Pizza 4 Queijos'
		}]

		const request = { httpMethod: 'POST', queryStringParameters: { terminal_id: '222' }, body: JSON.stringify(arr) }

		let result = await product(request)

		expect(result).toStrictEqual(badRequest())
		expect(result.statusCode).toBe(400)
	})

	test('Should_returns_ok_creating_all', async () => {

		mDynamoDb.get = jest.fn().mockImplementation(() => ({ promise: () => ( Promise.resolve({}) ) }))

		let arr = [ {
			extern_id: '3333',
			stock: 4,
			price: 89,
			name: 'Pizza 4 Queijos'
		},{
			extern_id: '4444',
			stock: 4,
			price: 89,
			name: 'Pizza 4 Queijos'
		}]

		const request = { httpMethod: 'POST', queryStringParameters: { terminal_id: '222' }, body: JSON.stringify(arr) }

		let result = await product(request)

		expect(JSON.parse(result.body).errors.length).toBe(0)
		expect(JSON.parse(result.body).created.length).toBe(2)
		expect(JSON.parse(result.body).status).toBe('success')
		expect(result.statusCode).toBe(200)
	})

	test('Should_returns_ok_updating_all', async () => {

		mDynamoDb.get = jest.fn().mockImplementation(() => {
			return {
				promise() {
					return Promise.resolve({
						extern_id: '3333',
						stock: 4,
						price: 89,
						name: 'Pizza 4 Queijos'
					})
				}
			}
		})

		let arr = [ {
			extern_id: '3333',
			stock: 4,
			price: 89,
			name: 'Pizza 4 Queijos'
		},{
			extern_id: '4444',
			stock: 4,
			price: 89,
			name: 'Pizza 4 Queijos'
		}]

		const request = { httpMethod: 'POST', queryStringParameters: { terminal_id: '222' }, body: JSON.stringify(arr) }

		let result = await product(request)

		expect(JSON.parse(result.body).errors.length).toBe(0)
		expect(JSON.parse(result.body).updated.length).toBe(2)
		expect(JSON.parse(result.body).status).toBe('success')
		expect(result.statusCode).toBe(200)
	})

	test('Should_returns_a_badrequest_delete_wrong_parameters', async () => {

		const request = { httpMethod: 'DELETE', queryStringParameters: { terminal_id: '222' } }

		let result = await product(request)

		expect(result).toStrictEqual(badRequestWithMessage({ error: 'missing/wrong parameters'}))
		expect(result.statusCode).toBe(400)
	})

	test('Should_returns_ok_delete', async () => {

		mDynamoDb.get = jest.fn().mockImplementation(() => {
			return {
				promise() {
					return Promise.resolve({
						extern_id: '222',
						stock: 4,
						price: 89,
						name: 'Pizza 4 Queijos'
					})
				}
			}
		})

		const request = { httpMethod: 'DELETE', queryStringParameters: { terminal_id: '222', extern_id: '222' } }

		let result = await product(request)

		expect(result.statusCode).toBe(200)
	})

	test('Should_returns_notfound_delete', async () => {

		mDynamoDb.get = jest.fn().mockImplementation(() => ({ promise: () => ( Promise.resolve({}) ) }))

		const request = { httpMethod: 'DELETE', queryStringParameters: { terminal_id: '222', extern_id: '222' } }

		let result = await product(request)

		expect(result).toStrictEqual(notFound())
		expect(result.statusCode).toBe(404)
	})

	test('Should_returns_badrequest_delete_dynamo_error', async () => {

		mDynamoDb.get = jest.fn().mockImplementation(() => {
			return {
				promise() {
					return Promise.resolve({
						extern_id: '222',
						stock: 4,
						price: 89,
						name: 'Pizza 4 Queijos'
					})
				}
			}
		})

		mDynamoDb.delete = jest.fn().mockImplementation(() => ({ }))

		const request = { httpMethod: 'DELETE', queryStringParameters: { terminal_id: '222', extern_id: '222' } }

		let result = await product(request)

		expect(result).toStrictEqual(badRequest())
		expect(result.statusCode).toBe(400)
	})

})