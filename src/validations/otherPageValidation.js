import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { PRODUCT_TYPE } from '~/utils/constants'
import CustomDate from '~/utils/customDate'
const PRODUCTS_COLLECTION_NAME = 'products'

const createNew = async (req, res, next) => {
	const correctCondition = Joi.object({
		name: Joi.string().required().max(50).trim(),

		description: Joi.string().max(256).trim(),
		color: Joi.string().max(50).trim(),
		supplier: Joi.string().max(50).trim(),
		material: Joi.string().max(50).trim(),

		type: Joi.string().valid(PRODUCT_TYPE.TOP, PRODUCT_TYPE.BOTTOM).required(),

		price: Joi.string(),
		quantity: Joi.string(),
		savePercent: Joi.string(),
		size: Joi.string(),

		createdAt: Joi.date().default(() => new CustomDate()),
		updatedAt: Joi.date().default(null)
	})
	try {
		await correctCondition.validateAsync(req.body, { abortEarly: false })
		next()
	}
	catch (err) {
		next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(err).message))
	}
}
// const update = async (req, res, next) => {
// 	const correctCondition = Joi.object({
// 		boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_MESSAGE),
// 		title: Joi.string().min(3).max(50).trim().strict()
// 	})
// 	try {
// 		await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
// 		next()
// 	}
// 	catch (err) {
// 		next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(err).message))
// 	}
// }
// const deleteColumn = async (req, res, next) => {
// 	const correctCondition = Joi.object({
// 		id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_MESSAGE)
// 	})
// 	try {
// 		await correctCondition.validateAsync(req.params)
// 		next()
// 	}
// 	catch (err) {
// 		next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(err).message))
// 	}
// }
export const otherPageValidation = {
	createNew,
	// update,
	// deleteColumn
}
