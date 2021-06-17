const mysql = require('serverless-mysql')

const sqlstring = require('sqlstring')
const errorFactory = require('error-factory')

const config = require('../config')
const connection_config = config.get('mysql')

const baseError = errorFactory('MySQLServiceError', [ 'message', 'details' ])

let _connection = null

const connect = () => {

	if(_connection && _connection.state !== 'disconnected')
		return _connection
    
	var connection = mysql({
		config: {
			host     : connection_config.host,
			user     : connection_config.user,
			password : connection_config.password,
			database : connection_config.database,
			multipleStatements: true,
		}
	})
		
	connection.connect()
	_connection = connection
	return connection
}

const getCompany = async (terminal_id) => {

	try {
		
		let conn = connect()

		let results = await conn.query('SELECT id_empresa, user_id FROM ws_empresa where pdv_terminal_id = ?;', [ terminal_id ])

		return results

	} catch (error) {
		throw baseError(`Error on select - ${error.message}`)
	}
	
}

const testMySql = async () => {
	
	try {
		let conn = connect()

		let results = await conn.query('SELECT id_empresa, user_id FROM ws_empresa where pdv_terminal_id = ?;', ['88443077-90cd-481f-9ae7-b5a0b1acb735'])

		console.log('The solution is: ', results)

	} catch (error) {
		throw baseError(`Error on select - ${error.message}`)
	}
	

}

const updateMany = async (user_id, products) => {
	
	try {
		const conn = connect()
		let query = ''

		products.forEach(product => {

			let available = product.stock > 0 ? 1 : 0

			query += sqlstring.format('UPDATE ws_itens SET disponivel = ?, preco_item = ?, extern_stock= ? where extern_id = ? AND user_id = ?;', 
				[ available , product.price, product.stock, product.extern_id, user_id], true)
		})

		let results = await conn.query(query)

		return results

	} catch (error) {
		throw baseError(`Error on Update - ${error.message}`)
	}
	
}

const endConnection = async () => await _connection.end()

module.exports = { testMySql, getCompany, updateMany, endConnection }
//module.exports = { getCompany, updateMany, endConnection }