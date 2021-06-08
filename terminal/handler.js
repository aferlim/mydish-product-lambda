const { v4: uuidv4 } = require('uuid')

const { notFound, ok, badRequest, badRequestWithMessage } = require('../response')
const { getAll, getByTerminalId, insert, update, remove } = require('./service')

const { validate } = require('./schema')

const get = async query => {

	if(query && query.terminal_id){
		return await genericReadHandler(query)(getByTerminalId)
	}

	if(query && query.type && query.type === 'all') {
		return await genericReadHandler()(getAll)
	}

	return notFound()
}

const post = async ({ body }) => {
	const terminal = body ? JSON.parse(body) : null

	if (!terminal) {
		return badRequestWithMessage({ error: 'missing/wrong parameters'})
	}

	terminal.terminal_id = uuidv4()

	try {
		if(await validate(terminal)) {

			await insert(terminal)
			return ok(terminal)
		}
	} catch (error) {
		console.log(error)
		return badRequest()
	}
}

const put = async ({ body }) => {
	const terminal = body ? JSON.parse(body) : null

	if (!terminal || !terminal.terminal_id) {
		return badRequestWithMessage({ error: 'missing/wrong parameters'})
	}
	
	try {
		if(await validate(terminal)) {

			let exists = await getByTerminalId({ terminal_id: terminal.terminal_id })

			if (exists && Object.keys(exists).length) {
				await update(terminal)
				return ok(terminal)
			} 
			return notFound()
		}
	} catch (error) {
		console.log(error)
		return badRequest()
	}
}

const genericReadHandler = params => async delegate => {
	try {
		if(params){
			let result = await delegate(params)
			return result && Object.keys(result).length ? ok(result) : notFound()
		}else{
			let result = await delegate()
			return result && Object.keys(result).length ? ok(result) : notFound()
		}
	} catch (error) {
		console.log(error)
		return badRequest()
	}
}

const delete_r = async ({ terminal_id }) => {
	if (!terminal_id) {
		return badRequestWithMessage({ error: 'missing/wrong parameters'})
	}

	try {
		let exists = await getByTerminalId({ terminal_id: terminal_id })

		if (exists && Object.keys(exists).length) {
			return ok(await remove(terminal_id))
		} else {
			return notFound()
		}
	} catch (error) {
		console.log(error)
		return badRequest()
	}
}

module.exports = { get, post, delete_r, put }