const mysql = require('mysql')
const sqlstring = require('sqlstring')
const errorFactory = require('error-factory')

const config = require('../config')
const connection_config = config.get('mysql')

const baseError = errorFactory('MySQLServiceError', [ 'message', 'details' ])

const _connection = null

const connect = () => {

	if(_connection && _connection.state !== 'disconnected')
		return _connection
    
	var connection = mysql.createConnection(
		{
			host     : connection_config.host,
			user     : connection_config.user,
			password : connection_config.password,
			database : connection_config.database,
			multipleStatements: true,
		})
		
	connection.connect()
	_connection = connection
	return connection
}

const getCompany = (terminal_id, callback) => {
	const conn = connect()
	conn.query('SELECT id_empresa, user_id FROM ws_empresa where pdv_terminal_id = ?;', [ terminal_id ], (error, results, fields) => {

		if (error) 
			throw baseError(`Error on select - ${error.message}`)

		callback(results, fields)
	})
}

const testMySql = () => {
	
	const conn = connect()
	conn.query('SELECT id_empresa, user_id FROM ws_empresa where pdv_terminal_id = ?;', ['88443077-90cd-481f-9ae7-b5a0b1acb735'], function (error, results, fields) {
		if (error) throw error
		console.log('The solution is: ', results)
		console.log(fields)
	})

}

const updateMany = (user_id, products, callback) => {
	
	const conn = connect()
	let query = ''

	products.forEach(product => {

		let available = product.stock > 0 ? 1 : 0

		query += sqlstring.format('UPDATE ws_itens SET disponivel = ?, preco_item = ?, extern_stock= ? where extern_id = ? AND user_id = ?;', 
			[ available , product.price, product.stock, product.extern_id, user_id], true)
	})

	conn.query(query, (error, results, fields) => {
		if (error) 
			throw baseError(`Error on update - ${error.message}`)

		callback(results, fields)
	})
}

const endConnection = () => _connection.end()

module.exports = { testMySql, getCompany, updateMany, endConnection }