import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_MESSAGE } from '~/utils/validators'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { PRODUCT_TYPE } from '~/utils/constants'
import { orderModel } from '~/models/OrderModel'
import CustomDate from '~/utils/customDate'
const CUSTOMER_COLLECTION_NAME = 'customers'

const PRODUCT_COLLECTION_SCHEMA = Joi.object({
	webId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_MESSAGE),
	name: Joi.string().required().min(3).max(64).trim(),

	description: Joi.string().trim(),
	color: Joi.string().max(50).trim(),
	supplier: Joi.string().required().min(3).max(64).trim(),
	material: Joi.string().required().min(3).max(64).trim(),
	size: Joi.string(),
	thumb: Joi.string(),

	type: Joi.string().valid(PRODUCT_TYPE.TOP, PRODUCT_TYPE.BOTTOM).required(),

	price: Joi.number().integer(),
	quantity: Joi.number().integer(),
	savePercent: Joi.number().integer().min(0).max(100),

	createdAt: Joi.date().default(() => new CustomDate()),
	updatedAt: Joi.date().default(null)
})

const INVALID_UPDATE_FIELDS = ['_id']

const validate = async (data) => {

	return await PRODUCT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {

	try {
		const validData = await validate(data)
		const resuil = await GET_DB().collection(CUSTOMER_COLLECTION_NAME).insertOne({ ...validData, webId: new ObjectId(validData.webId), sold: 0 })

		const newId = resuil.insertedId

		await GET_DB().collection(CUSTOMER_COLLECTION_NAME).updateOne(
			{ _id: newId },
			{ $set: { barcode: newId.toString() } }
		)

		return resuil
	} catch (error) {
		throw new Error(error)
	}

}
const findOneById = async (webId, productId) => {
	try {
		return await GET_DB().collection(CUSTOMER_COLLECTION_NAME).findOne({
			_id: new ObjectId(productId),
			webId: new ObjectId(webId),
		}) || null

	} catch (error) {
		throw new Error(error)
	}
}


const getCustomerByPage = async (webId, startIndex, limit, filterObj) => {
	const query = {
		webId: new ObjectId(webId),
		...filterObj.email !== '' ? { email: filterObj.email } : {},
		...filterObj.phone !== '' ? { phone: filterObj.phone } : {},
		...filterObj.fullname !== '' ? { fullname: filterObj.fullname } : {},
		...(filterObj.searchtext ? {
			$or: [
				{ email: { $regex: filterObj.searchtext, $options: 'i' } },
				{ phone: { $regex: filterObj.searchtext, $options: 'i' } },
				{ fullname: { $regex: filterObj.searchtext, $options: 'i' } },
			]
		} : {}),
	}

	try {
		const result = await GET_DB().collection(CUSTOMER_COLLECTION_NAME).find(query).sort({ createdAt: -1 }).limit(limit).skip(startIndex).toArray()

		const totalCustomerForType = await filterCustomer(webId, filterObj)
		const totalCustomer = totalCustomerForType.length
		const totalPage = Math.ceil(totalCustomer / limit)

		return { totalCustomer, totalPage, data: result || null }

	} catch (error) {
		throw new Error(error)
	}
}
const filterCustomer = async (webId, filterObj) => {
	try {
		return await GET_DB().collection(CUSTOMER_COLLECTION_NAME).find({
			webId: new ObjectId(webId),
			...filterObj.email !== '' ? { email: filterObj.email } : {},
			...filterObj.phone !== '' ? { phone: filterObj.phone } : {},
			...filterObj.fullname !== '' ? { fullname: filterObj.fullname } : {},
			...(filterObj.searchtext ? {
				$or: [
					{ email: { $regex: filterObj.searchtext, $options: 'i' } },
					{ phone: { $regex: filterObj.searchtext, $options: 'i' } },
					{ fullname: { $regex: filterObj.searchtext, $options: 'i' } },
				]
			} : {}),
		}).toArray()

	} catch (error) {
		throw new Error(error)
	}
}
const getBestSeller = async (webId, type, number) => {
	const query = {
		type: type,
		webId: new ObjectId(webId),
		quantity: { $gt: 0 }
	}
	const result = await GET_DB().collection(CUSTOMER_COLLECTION_NAME).find(query).sort({ sold: -1 }).limit(number).toArray()
	return result
}
const update = async (productList) => {
	const bulkOperations = productList.map(product => ({

		updateOne: {
			filter: { _id: new ObjectId(product.productID) },
			update: {
				$inc: {
					sold: product.quantity,
					quantity: -product.quantity
				},
			}
		},
	}))
	try {
		const result = await GET_DB().collection(CUSTOMER_COLLECTION_NAME).bulkWrite(bulkOperations)
		return result
	} catch (error) {
		throw new Error(error)
	}

}
export const customerModel = {
	PRODUCT_COLLECTION_SCHEMA,
	createNew,
	getCustomerByPage,
	findOneById,
	filterCustomer,
	getBestSeller,
	update
}
