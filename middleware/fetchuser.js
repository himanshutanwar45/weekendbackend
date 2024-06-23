const jwt = require('jsonwebtoken');
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET

const fetchuser = (req, res, next) => {
    const token = req.header('auth-token')
    //check if not token
    if (!token) {
        return res.status(401).json({ msg: "No Token Provided" })
    }

    try {
        const data = jwt.verify(token, JWT_SECRET)

        req.user = data.user;

        next()
    } catch (error) {
        return res.status(401).json({ msg: "Internal Error occured" })
    }


}

module.exports = fetchuser;