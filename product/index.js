
const AWS = require('aws-sdk')
const { ok, badRequestWithMessage } = require('../response')

const dynamoDb = new AWS.DynamoDB.DocumentClient()
const TABLENAME = 'product'

const getAll = async () => {
	try {
		return ok(await dynamoDb.scan({ TableName: TABLENAME }).promise())    
	} catch (error) {
		return badRequestWithMessage({error: error.message})
	}
}

// const getById = id => {

// }

module.exports = { getAll }