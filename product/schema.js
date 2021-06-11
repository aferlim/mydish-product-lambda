const { Validator } = require('node-input-validator')
const errorFactory = require('error-factory')
const moment = require('moment-timezone')

const ProductError = errorFactory('ProductSchemaError', [ 'message', 'details' ])

const validationSchema = {
	terminal_id: 'required|string',
	extern_id: 'required|string',
	stock: 'required|integer',
	price: 'required|decimal',
	name: 'required|string'
}

const validate = async product => {

	const valid = new Validator(product, validationSchema)
	const matched = await valid.check()

	if(!matched){
		throw ProductError(valid.errors)
	}
	return true
}

const setProduct = (table, product) => {
	return {
		TableName: table,
		Item: {
			'terminal_id': product.terminal_id,
			'extern_id': product.extern_id,
			'stock': product.stock,
			'price': product.price,
			'name': product.name,
			'create_date': moment.tz('America/Sao_Paulo').format(),
			'update_date':  moment.tz('America/Sao_Paulo').format()
		}
	}
}

const setUpdateProduct = (table, product) => {
	return {
		TableName: table,
		Key:{
			'extern_id': product.extern_id,
			'terminal_id':  product.terminal_id
		},
		UpdateExpression: 'set #stock = :s, #price=:p, #name=:n, #update_date=:d',
		ExpressionAttributeNames: {
			'#name': 'name',
			'#stock': 'stock',
			'#update_date': 'update_date',
			'#price': 'price'
		},
		ExpressionAttributeValues:{
			':s':product.stock,
			':p':product.price,
			':n':product.name,
			':d': moment.tz('America/Sao_Paulo').format()
		},
		ReturnValues:'UPDATED_NEW'
	}
}

module.exports = { validate, setProduct, setUpdateProduct }