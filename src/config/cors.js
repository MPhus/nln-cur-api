import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { WHITELIST_DOMAIN } from '~/utils/constants'
import { env } from './environment'

export const corsOptions = {
	// origin: function (origin, callback) {

	// 	if (env.BUILD_MODE === 'dev') {
	// 		return callback(null, true)
	// 	}

	// 	if (WHITELIST_DOMAIN.includes(origin)) {
	// 		return callback(null, true)
	// 	}

	// 	return callback(new ApiError(StatusCodes.FORBIDDEN, `${origin} is not allowed by our CORS Policy`))
	// },
	origin: function (origin, callback) {
		return callback(null, true)
	},
	optionsSuccessStatus: 200,

	// ------Cookies-----
	credentials: true
}
