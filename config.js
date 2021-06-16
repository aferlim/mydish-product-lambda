const config = {
	mysql: {
		host: process.env.MYSQL_SERVER || 'localhost',
		port: process.env.MYSQL_PORT || '3306',
		user: process.env.MYSQL_USER || 'mydish',
		password: process.env.MYSQL_PASSWORD || 'pass',
		database: process.env.MYSQL_DATABASE || 'database',
	}
}

module.exports = { get: key => config[key] }