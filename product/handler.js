const { notFound, ok, badRequest, badRequestWithMessage } = require('../response')
const { getAll, getByExternId, getByTerminalId, insert, update, remove } = require('./service')

const terminalService = require('../terminal/service')

const { validate } = require('./schema')

const get = async query => {

	if(query && query.terminal_id){

		if(query.extern_id){
			return await genericReadHandler(query)(getByExternId)
		}

		return await genericReadHandler(query)(getByTerminalId)
	}

	if(query && query.type && query.type === 'all') {
		return await genericReadHandler()(getAll)
	}

	return notFound()
}

const post = async ({ body, queryStringParameters  }) => {
	
	const { terminal_id } = queryStringParameters
	const products = body ? JSON.parse(body) : null

	if (!products || !Array.isArray(products) || !terminal_id) {
		return badRequestWithMessage({ error: 'missing/wrong parameters'})
	}

	let response_body = { status: null, created: [], updated: [], errors: [] }

	await Promise.all(products.map(async prod_item => {
		try {
			prod_item.terminal_id = terminal_id

			if(await validate(prod_item)) {
				
				let valid_terminal = await terminalService.getByTerminalId({ terminal_id })

				if (valid_terminal && Object.keys(valid_terminal).length) {

					let exists = await getByExternId({ terminal_id: terminal_id, extern_id: prod_item.extern_id })

					if (exists && Object.keys(exists).length) {

						await update(prod_item)
						response_body.updated.push(prod_item)

					} else {

						await insert(prod_item)
						response_body.created.push(prod_item)

					}
				} else {
					response_body.errors.push({ err: 'invalid teminal', ...prod_item })
				}
				
			}
		} catch (error) {
			console.log(error)
			response_body.errors.push({ err: error, ...prod_item })
		}
	}))

	const status = (response_body.created.length || response_body.updated.length) ? response_body.errors.length ? 'processed with errors' : 'success' : 'error'

	if(status == 'error')
		return badRequestWithMessage({ ...response_body, status: status })

	return ok({ ...response_body, status: status })
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

const delete_r = async ({ terminal_id, extern_id }) => {
	if (!extern_id || !terminal_id) {
		return badRequestWithMessage({ error: 'missing/wrong parameters'})
	}

	try {
		let exists = await getByExternId({ terminal_id: terminal_id, extern_id: extern_id })

		if (exists && Object.keys(exists).length) {
			return ok(await remove(terminal_id, extern_id))
		} else {
			return notFound()
		}
	} catch (error) {
		console.log(error)
		return badRequest()
	}
}

module.exports = { get, post, delete_r }