/** Import des modules */
const http = require('http')
const app = require('./app')


//** Initialisation du serveur */
app.set('port', process.env.PORT || 3000)

const server = http.createServer(app)


//** Start server */
server.listen(process.env.PORT || 3000)