const AWS = require('aws-sdk')
const { terminal } = require('./index')

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

describe('Terminal Suite', () => {

	beforeAll(() => { console.log = jest.fn() })

	afterAll(() => {
		jest.resetAllMocks()
	})

	test('Should_returns_notfound_invalid_get', async () => {
		const request = { httpMethod: 'GET', queryStringParameters: null }

		let result = await terminal(request)

		expect(result.statusCode).toBe(404)
	})

	test('Should_returns_ok_all', async () => {

		const request = { httpMethod: 'GET', queryStringParameters: {type: 'all'} }

		let result = await terminal(request)

		expect(result.statusCode === 200).toBeTruthy()
	})

	test('Should_returns_a_badrequest_all_dynamo_error', async () => {

		mDynamoDb.scan.mockReturnValue(null)

		const request = { httpMethod: 'GET', queryStringParameters: {type: 'all'} }

		let result = await terminal(request)

		expect(result).toStrictEqual(badRequest())
		expect(result.statusCode).toBe(400)
	})

	test('Should_returns_ok_one', async () => {

		const request = { httpMethod: 'GET', queryStringParameters: { terminal_id: 2 } }

		let result = await terminal(request)

		let should = ok({id: '1' })

		expect(result).toStrictEqual(should)
		expect(result.statusCode).toBe(200)
	})

	test('Should_returns_notfound_one', async () => {

		mDynamoDb.get = jest.fn().mockImplementation(() => ({ promise: () => (Promise.resolve({})) }))

		const request = { httpMethod: 'GET', queryStringParameters: { terminal_id: 2 } }

		let result = await terminal(request)

		expect(result.statusCode).toBe(404)
	})

	test('Should_returns_a_badrequest_one_dynamo_error', async () => {

		mDynamoDb.get.mockReturnValue(null)

		const request = { httpMethod: 'GET', queryStringParameters: { terminal_id: 2 } }

		let result = await terminal(request)

		expect(result).toStrictEqual(badRequest())
		expect(result.statusCode).toBe(400)
	})

	test('Should_returns_a_badrequest_POST_invalid_request', async () => {

		const request = { httpMethod: 'POST', body: null }

		let result = await terminal(request)

		expect(result).toStrictEqual(badRequestWithMessage({ error: 'missing/wrong parameters'}))
		expect(result.statusCode).toBe(400)
	})

	test('Should_returns_a_badrequest_POST_invalid_payload', async () => {

		let payload = {
			active: 4, // invalid, true
			name: 'Pizza 4 Queijos'
		}

		const request = { httpMethod: 'POST', body: JSON.stringify(payload) }

		let result = await terminal(request)

		expect(result).toStrictEqual(badRequest())
		expect(result.statusCode).toBe(400)
	})

	test('Should_returns_ok_POST', async () => {

		mDynamoDb.get = jest.fn().mockImplementation(() => ({ promise: () => ( Promise.resolve({}) ) }))

		let payload = {
			active: true,
			name: 'Pizza 4 Queijos'
		}

		const request = { httpMethod: 'POST', body: JSON.stringify(payload) }

		let result = await terminal(request)

		expect(JSON.parse(result.body)).not.toBeNull()
		expect(JSON.parse(result.body).terminal_id).not.toBeNull()
		expect(JSON.parse(result.body).terminal_id).not.toBeUndefined()
		expect(result.statusCode).toBe(200)
	})

	test('Should_returns_a_badrequest_PUT_invalid_request', async () => {

		const request = { httpMethod: 'PUT', body: JSON.stringify({ name: 'vavlid' }) }

		let result = await terminal(request)

		expect(result).toStrictEqual(badRequestWithMessage({ error: 'missing/wrong parameters'}))
		expect(result.statusCode).toBe(400)
	})

	test('Should_returns_a_badrequest_PUT_invalid_payload', async () => {

		let payload = {
			terminal_id: 'valid',
			active: 4, //invalid
			name: 'Pizza 4 Queijos'
		}

		const request = { httpMethod: 'PUT', body: JSON.stringify(payload) }

		let result = await terminal(request)

		expect(result).toStrictEqual(badRequest())
		expect(result.statusCode).toBe(400)
	})

	test('Should_returns_ok_PUT', async () => {

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

		let payload = {
			terminal_id: 'valid',
			active: true,
			name: 'Pizza 4 Queijos'
		}

		const request = { httpMethod: 'POST', body: JSON.stringify(payload) }

		let result = await terminal(request)

		expect(JSON.parse(result.body)).not.toBeNull()
		expect(JSON.parse(result.body).terminal_id).not.toBeNull()
		expect(JSON.parse(result.body).terminal_id).not.toBeUndefined()
		expect(result.statusCode).toBe(200)
	})

	test('Should_returns_a_badrequest_delete_wrong_parameters', async () => {

		const request = { httpMethod: 'DELETE', queryStringParameters: { x: '222' } }

		let result = await terminal(request)

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

		const request = { httpMethod: 'DELETE', queryStringParameters: { terminal_id: '222' } }

		let result = await terminal(request)

		expect(result.statusCode).toBe(200)
	})

	test('Should_returns_notfound_delete', async () => {

		mDynamoDb.get = jest.fn().mockImplementation(() => ({ promise: () => ( Promise.resolve({}) ) }))

		const request = { httpMethod: 'DELETE', queryStringParameters: { terminal_id: '222' } }

		let result = await terminal(request)

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

		const request = { httpMethod: 'DELETE', queryStringParameters: { terminal_id: '222' } }

		let result = await terminal(request)

		expect(result).toStrictEqual(badRequest())
		expect(result.statusCode).toBe(400)
	})

})