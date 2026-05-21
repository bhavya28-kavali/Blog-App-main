import jwt from 'jsonwebtoken'
import {config} from 'dotenv'
config()

export const verifyToken = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            // read token from cookie or Authorization header
            let token = req.cookies?.token || (req.headers?.authorization ? req.headers.authorization.split(' ')[1] : null)
            if (!token) {
                return res.status(401).json({ message: "Unauthorized request. Please Login" })
            }

            // verify and decode token
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

            // if roles provided, check role; if none provided, allow any authenticated user
            if (allowedRoles.length > 0 && !allowedRoles.includes(decodedToken.role)) {
                return res.status(403).json({ message: "Forbidden. You don't have access to this resource" })
            }

            // attach user info to req
            req.user = decodedToken

            next()
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Session expired. please login again' })
            }
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid Token. please retry' })
            }
            next(err)
        }
    }
}