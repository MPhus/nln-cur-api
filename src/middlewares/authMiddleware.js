import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from './../providers/JwtProvider'
import { env } from '~/config/environment'

const isAuthorized = async (req, res, next) => {
	// ----- Cookie---------
	const cookieAccessToken = req.cookies.accessToken
	if (!cookieAccessToken) {
		res.status(StatusCodes.UNAUTHORIZED).json({ message: 'UNAUTHORIZED' })
		return
	}
	try {
		const accessTokenDecoded = await JwtProvider.verifyToken(
			// -----Cookie---------
			cookieAccessToken,

			env.ACCESS_TOKEN_SECRET_SIGNATURE
		)

		req.jwtDecoded = accessTokenDecoded

		next()

	} catch (error) {
		if (error.message.includes('jwt expired')) {
			res.status(StatusCodes.GONE).json({ message: 'Need to refresh token on au' })
			return
		}
		res.status(StatusCodes.UNAUTHORIZED).json({ message: 'invalid token' })

	}
}

export const authMiddleware = {
	isAuthorized
}
