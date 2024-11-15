import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPE } from '~/utils/constant'
import { OBJECT_ID_MESSAGE, OBJECT_ID_RULE } from '~/utils/validators'

const createNew = async (req, res, next) => {
	const correctCondition = Joi.object({
		title: Joi.string().required().min(3).max(50).trim().strict(),
		description: Joi.string().required().min(3).max(50).trim().strict(),
		type: Joi.string().valid(BOARD_TYPE.PUBLIC, BOARD_TYPE.PRIVATE).required()
	})
	try {
		await correctCondition.validateAsync(req.body, { abortEarly: false })
		next()
	}
	catch (err) {
		next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(err).message))
	}
}
const update = async (req, res, next) => {
	const correctCondition = Joi.object({
		title: Joi.string().min(3).max(50).trim().strict(),
		description: Joi.string().min(3).max(50).trim().strict(),
		type: Joi.string().valid(BOARD_TYPE.PUBLIC, BOARD_TYPE.PRIVATE)
	})
	try {
		await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
		next()
	}
	catch (err) {
		next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(err).message))
	}
}
const moveCardToOtherColumn = async (req, res, next) => {
	const correctCondition = Joi.object({
		currentCardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_MESSAGE),

		oldColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_MESSAGE),
		oldCardOrderIds: Joi.array().required().items(
			Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_MESSAGE)
		).default([]),

		newColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_MESSAGE),
		newCardOrderId: Joi.array().required().items(
			Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_MESSAGE)
		).default([])

	})
	try {
		await correctCondition.validateAsync(req.body, { abortEarly: false })
		next()
	}
	catch (err) {
		next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(err).message))
	}
}

export const broadValidation = {
	createNew,
	update,
	moveCardToOtherColumn
}
