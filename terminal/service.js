
const AWS = require('aws-sdk')
const errorFactory = require('error-factory')

const { validate, setTerminal, setUpdateTerminal } = require('./schema')

const errorF = errorFactory('terminalServiceError', [ 'message', 'details' ])

const dynamoDb = new AWS.DynamoDB.DocumentClient()
const TABLE_NAME = 'terminal'

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

	const params = {
		TableName : TABLE_NAME,
		Key:{
			'terminal_id': terminal_id
		}
	}

	try {
		return await dynamoDb.get(params).promise()
	} catch (error) {
		throw errorF(`getByTerminalId - ${error.message}`)
	}
}

const insert = async terminal => {
	try {
		if(await validate(terminal)){
			await dynamoDb.put(setTerminal(TABLE_NAME, terminal)).promise()
		}
	} catch (error) {
		throw errorF(`insert - ${error.message}`)
	}
}

const update = async terminal => {
	if (await validate(terminal)) {
		try {
			await dynamoDb.update(setUpdateTerminal(TABLE_NAME, terminal)).promise()
		} catch (error) {
			throw errorF(`update - ${error.message}`)
		}
	}
}

const remove = async (terminal_id) => {
	const removeParams = {
		TableName : TABLE_NAME,
		Key:{
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
	insert,
	update,
	remove
}