import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { EMAIL_REGEX, PAY_METHOD } from '~/utils/constants'
import CustomDate from '~/utils/customDate'
//
const createNew = async (req, res, next) => {
	const correctCondition = Joi.object({
		fullname: Joi.string().required().max(128).trim(),
		email: Joi.string().required().pattern(EMAIL_REGEX).message('Sai email'),
		address: Joi.string().required().max(128).trim(),
		city: Joi.string().required().max(128).trim(),
		district: Joi.string().required().max(128).trim(),

		payMethod: Joi.string().valid(PAY_METHOD.ZALOPAY, PAY_METHOD.CASH).required(),

		note: Joi.string(),
		phone: Joi.string(),
		ward: Joi.string().required().max(128).trim(),

		createdAt: Joi.date().default(() => new CustomDate()),
	})
	try {
		await correctCondition.validateAsync(req.body.info, { abortEarly: false })
		next()
	}
	catch (err) {
		next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(err).message))
	}
}

export const orderValidation = {
	createNew
}
