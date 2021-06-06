
const AWS = require('aws-sdk')

const errorFactory = require('error-factory')

const { validate, setProduct, setUpdateProduct } = require('./schema')

const errorF = errorFactory('productServiceError', [ 'message', 'details' ])

const dynamoDb = new AWS.DynamoDB.DocumentClient()
const TABLE_NAME = 'product'

const getAll = async () => {
	try {
		return await dynamoDb.scan({ TableName: TABLE_NAME }).promise()
	} catch (error) {
		throw errorF(`getAll Error - ${error.message}`)
	}
}

const getByTerminalId = async ({ terminal_id }) => {
	const params = {
		TableName : TABLE_NAME,
		KeyConditionExpression: '#terminal = :input',
		ExpressionAttributeNames:{
			'#terminalid': 'terminal_id'
		},
		ExpressionAttributeValues: {
			':input': terminal_id
		}
	}

	try {
		return await dynamoDb.query(params).promise()
	} catch (error) {
		throw errorF(`getByTerminalId - ${error.message}`)
	}
}

const getByExternId = async ({ terminal_id, extern_id }) => {
	const params = {
		TableName : TABLE_NAME,
		Key:{
			'extern_id': extern_id,
			'terminal_id': terminal_id
		}
	}

	try {
		return await dynamoDb.get(params).promise()
	} catch (error) {
		throw errorF(`getByExternId - ${error.message}`)
	}
}

const insert = async product => {
	try {
		if(await validate(product)){
			await dynamoDb.put(setProduct(TABLE_NAME, product)).promise()
		}
	} catch (error) {
		throw errorF(`insert - ${error.message}`)
	}
}

const update = async product => {
	if (await validate(product)) {
		try {
			await dynamoDb.update(setUpdateProduct(TABLE_NAME, product)).promise()
		} catch (error) {
			throw errorF(`update - ${error.message}`)
		}
	}
}

const remove = async (extern_id, terminal_id) => {
	const removeParams = {
		TableName : TABLE_NAME,
		Key:{
			'extern_id': extern_id,
			'terminal_id': terminal_id
		}
	}

	try {
		await dynamoDb.delete(removeParams).promise()
	} catch (error) {
		throw errorF(`delete - ${error.message}`)
	}
}

module.exports = { 
	getAll, 
	getByTerminalId, 
	getByExternId, 
	insert, 
	update,
	remove
}