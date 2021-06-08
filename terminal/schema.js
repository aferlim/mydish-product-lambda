const { Validator } = require('node-input-validator')
const errorFactory = require('error-factory')
const moment = require('moment-timezone')

const TerminalError = errorFactory('TerminalSchemaError', [ 'message', 'details' ])

const validationSchema = {
	terminal_id: 'required',
	active: 'required|boolean',
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
			'state_id': terminal.active ? 1 : 0,
			'active': terminal.active,
			'name': terminal.name,
			'client_ip': terminal.client_ip,
			'create_date': moment.tz('America/Sao_Paulo').format(),
			'update_date':  moment.tz('America/Sao_Paulo').format()
		}
	}
    
}

const setUpdateTerminal = (table, terminal) => {

	return {
		TableName: table,
		Key:{
			'extern_id': terminal.extern_id,
		},
		UpdateExpression: 'set active = :s, name=:n, update_date=:d, client_ip=:cl_ip, state_id=:sti',
		ExpressionAttributeValues:{
			':s': terminal.active,
			':sti': terminal.active ? 1 : 0,
			':n': terminal.name,
			':d': moment.tz('America/Sao_Paulo').format(),
			':cl_ip': terminal.client_ip
		},
		ReturnValues:'UPDATED_NEW'
	}
}

module.exports = { validate, setTerminal, setUpdateTerminal }