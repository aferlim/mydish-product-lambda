const {notFound, ok, badRequest, badRequestWithMessage } = require('../response')
const { getAll, getByExternId, getByTerminalId, insert, update } = require('./service')

const { validate } = require('./schema')

const get = async query => {

	if(query && query.terminal_id){

		if(query.extern_id){
			return await genericHandler({ ...query })(getByExternId)
		}

		return await genericHandler({ ...query })(getByTerminalId)
	}

	if(query && query.type && query.type === 'all') {
		return await genericHandler()(getAll)
	}

	return notFound()
}

const post = async ({ body, queryStringParameters  }) => {
	
	const { terminal_id } = queryStringParameters
	const products = JSON.parse(body)

	if (!Array.isArray(products) || !terminal_id) {
		return badRequestWithMessage({ error: 'invalid request, products=array, query=terminal_id'})
	}

	let response_body = { status: 'sucess', success: [], errors: []}

	await Promise.all(products.map(async prod_item => {
		try {
			
			prod_item.terminal_id = terminal_id

			if(await validate(prod_item)) {
				
				let exists = getByExternId({ terminal_id: terminal_id, extern_id: prod_item.extern_id })

				if (await exists) {
					await update(prod_item)
				} else {
					await insert(prod_item)
				}
				response_body.success.push(prod_item)
			}
		} catch (error) {
			console.log(error)
			response_body.errors.push(prod_item)
		}
	}))

	const status = response_body.success.length ? response_body.errors.length ? 'processed with errors' : 'success' : 'error'

	if(status == 'error')
		return badRequest()

	return ok({ status: status, ...response_body})
}

const genericHandler = params => async delegate => {
	try {
		if(params){
			return ok(await delegate(params))
		}else{
			return ok(await delegate())
		}
	} catch (error) {
		console.log(error)
		return badRequest()
	}
}

module.exports = { get, post }