const { Validator } = require('node-input-validator')
const errorFactory = require('error-factory')

const ProductError = errorFactory('ProductSchemaError', [ 'message', 'details' ])

const validationSchema = {
	terminal_id: 'required',
	extern_id: 'required',
	stock: 'required',
	price: 'required',
	name: 'required'
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
			'name': product.name
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
		UpdateExpression: 'set stock = :s, price=:p, name=:n',
		ExpressionAttributeValues:{
			':s':product.stock,
			':p':product.price,
			':n':product.name
		},
		ReturnValues:'UPDATED_NEW'
	}
}

module.exports = { validate, setProduct, setUpdateProduct }