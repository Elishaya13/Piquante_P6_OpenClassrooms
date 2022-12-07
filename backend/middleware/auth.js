const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1] // recupere la valeur qui se trouve apres le "bearer"
        const decodedToken = jwt.verify(token, process.env.TOKEN_JWT)
        const userId = decodedToken.userId
        req.auth = {
            userId: userId
        }
        next()
    }
    catch (error) {
        res.status(401).json({ error })
    }
}