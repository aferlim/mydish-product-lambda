
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

	if(!terminal_id) {
		throw errorF('getByTerminalId - invalid parameter terminal_id')
	}

	if(typeof terminal_id != 'string') {
		throw errorF('getByTerminalId - terminal_id must be string')
	}

	const params = {
		TableName : TABLE_NAME,
		KeyConditionExpression: '#terminalid = :input',
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

	if(!terminal_id || !extern_id) {
		throw errorF('getByTerminalId - invalid parameter terminal_id / extern_id')
	}

	if(typeof terminal_id != 'string') {
		throw errorF('getByTerminalId - terminal_id must be string')
	}

	if(typeof extern_id != 'string') {
		throw errorF('getByTerminalId - extern_id must be string')
	}

	const params = {
		TableName : TABLE_NAME,
		Key:{
			'terminal_id': terminal_id,
			'extern_id': extern_id
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

const remove = async (terminal_id, extern_id) => {
	const removeParams = {
		TableName : TABLE_NAME,
		Key:{
			'terminal_id': terminal_id,
			'extern_id': extern_id
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