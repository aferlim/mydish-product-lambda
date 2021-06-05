const { Validator } = require('node-input-validator')
const errorFactory = require('error-factory')
const moment = require('moment-timezone')

const TerminalError = errorFactory('TerminalSchemaError', [ 'message', 'details' ])

const validationSchema = {
	terminal_id: 'required',
	status: 'required|boolean',
	name: 'required'
}

const validate = async terminal => {

	const valid = new Validator(terminal, validationSchema)
	const matched = await valid.check()

	if(!matched){
		throw TerminalError(valid.errors)
	}
	return true
}

const setTerminal = (table, terminal) => {

	return {
		TableName: table,
		Item: {
			'terminal_id': terminal.terminal_id,
			'status': terminal.status,
			'name': terminal.name,
			'create_date': moment.tz('America/Sao_Paulo').format(),
			'update_date':  moment.tz('America/Sao_Paulo').format()
		}
	}
    
}

const setUpdateTerminal = (table, product) => {

	return {
		TableName: table,
		Key:{
			'extern_id': product.extern_id,
			'terminal_id':  product.terminal_id
		},
		UpdateExpression: 'set status = :s, name=:n, update_date=:d',
		ExpressionAttributeValues:{
			':s': product.status,
			':n': product.name,
			':d': moment.tz('America/Sao_Paulo').format()
		},
		ReturnValues:'UPDATED_NEW'
	}
}

module.exports = { validate, setTerminal, setUpdateTerminal }