const headers = { 'Content-Type': 'application/json' }

const ok = (data) => _default(200, data)

const noContent = () => _default(204)

const notFound = () => _default(404)

const badRequest = () => _default(400)

const badRequestWithMessage = data => _default(400, data)

const created = () => _default(201)

const conflict = () => _default(409)

const _default = (code, body) => ({
	statusCode: code,
	body: JSON.stringify(body) || '',
	headers: headers
})

module.exports = {
	ok,
	noContent,
	notFound,
	badRequest,
	badRequestWithMessage,
	created,
	conflict
}