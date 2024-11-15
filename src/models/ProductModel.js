import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_MESSAGE } from '~/utils/validators'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { PRODUCT_TYPE } from '~/utils/constants'
import CustomDate from '~/utils/customDate'
const PRODUCTS_COLLECTION_NAME = 'products'

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

const INVALID_UPDATE_FIELDS = ['_id', 'webId']
const validate = async (data) => {

	return await PRODUCT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {

	try {
		const validData = await validate(data)
		const resuil = await GET_DB().collection(PRODUCTS_COLLECTION_NAME).insertOne({ ...validData, webId: new ObjectId(validData.webId), sold: 0 })

		const newId = resuil.insertedId

		await GET_DB().collection(PRODUCTS_COLLECTION_NAME).updateOne(
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
		return await GET_DB().collection(PRODUCTS_COLLECTION_NAME).findOne({
			_id: new ObjectId(productId),
			webId: new ObjectId(webId),
		}) || null

	} catch (error) {
		throw new Error(error)
	}
}

// isGetSoldOut
const getProductByPage = async (webId, startIndex, limit, filterObj) => {
	const query = {
		webId: new ObjectId(webId),
		...filterObj.type !== '' ? { type: filterObj.type } : {},
		...filterObj.color !== '' ? { color: filterObj.color } : {},
		...filterObj.size !== '' ? { size: filterObj.size } : {},
		...filterObj.fabric !== '' ? { material: filterObj.fabric } : {},
		...(filterObj.searchtext ? {
			$or: [
				{ name: { $regex: filterObj.searchtext, $options: 'i' } },
				{ material: { $regex: filterObj.searchtext, $options: 'i' } },
				{ type: { $regex: filterObj.searchtext, $options: 'i' } },
				{ color: { $regex: filterObj.searchtext, $options: 'i' } },
				{ barcode: { $regex: filterObj.searchtext, $options: 'i' } },
				// Thêm các trường khác mà bạn muốn tìm kiếm
			]
		} : {}),
		...(filterObj.isGetSoldOut === 'true' ? {} : { quantity: { $gt: 0 } })
	}
	let sortOption = {}
	if (filterObj.price === 'increase') {
		sortOption = { price: 1 }
	} else if (filterObj.price === 'decrease') {
		sortOption = { price: -1 }
	} else if (filterObj.price === 'latest') {
		sortOption = { createdAt: -1 }
	}
	try {
		const result = await GET_DB().collection(PRODUCTS_COLLECTION_NAME).find(query).sort(sortOption).limit(limit).skip(startIndex).toArray()

		const totalProductForType = await filterProduct(webId, filterObj)
		const totalProduct = totalProductForType.length
		const totalPage = Math.ceil(totalProduct / limit)

		return { totalProduct, totalPage, data: result || null }

	} catch (error) {
		throw new Error(error)
	}
}
const filterProduct = async (webId, filterObj) => {
	try {
		return await GET_DB().collection(PRODUCTS_COLLECTION_NAME).find({
			webId: new ObjectId(webId),
			...filterObj.type !== '' ? { type: filterObj.type } : {},
			...filterObj.color !== '' ? { color: filterObj.color } : {},
			...filterObj.size !== '' ? { size: filterObj.size } : {},
			...filterObj.fabric !== '' ? { material: filterObj.fabric } : {},
			...(filterObj.searchtext !== '' ? {
				$or: [
					{ name: { $regex: filterObj.searchtext, $options: 'i' } },
					{ material: { $regex: filterObj.searchtext, $options: 'i' } },
					{ type: { $regex: filterObj.searchtext, $options: 'i' } },
					{ color: { $regex: filterObj.searchtext, $options: 'i' } },
					{ barcode: { $regex: filterObj.searchtext, $options: 'i' } },
				]
			} : {}),
			...(filterObj.isGetSoldOut === 'true' ? {} : { quantity: { $gt: 0 } })
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
	const result = await GET_DB().collection(PRODUCTS_COLLECTION_NAME).find(query).sort({ sold: -1 }).limit(number).toArray()
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
		const result = await GET_DB().collection(PRODUCTS_COLLECTION_NAME).bulkWrite(bulkOperations)
		return result
	} catch (error) {
		throw new Error(error)
	}

}
const updateDetail = async (data) => {
	const { _id, webId } = data
	Object.keys(data).forEach(field => {
		if (INVALID_UPDATE_FIELDS.includes(field)) {
			delete data[field]
		}
	})
	console.log('data: ', data)

	const result = await GET_DB().collection(PRODUCTS_COLLECTION_NAME).findOneAndUpdate(
		{
			_id: new ObjectId(_id),
			webId: new ObjectId(webId),
		},
		{ $set: data },
		{ returnDocument: 'after' }
	)
	return result
}
const deleteProduct = async (id) => {
	try {
		return await GET_DB().collection(PRODUCTS_COLLECTION_NAME).deleteOne({
			_id: new ObjectId(id)
		})

	} catch (error) {
		throw new Error(error)
	}
}
export const productModel = {
	PRODUCT_COLLECTION_SCHEMA,
	createNew,
	getProductByPage,
	findOneById,
	filterProduct,
	getBestSeller,
	update,
	updateDetail,
	deleteProduct
}
