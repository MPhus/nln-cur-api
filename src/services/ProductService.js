/* eslint-disable no-useless-catch */
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { productModel } from '~/models/ProductModel'
import { maxForQuantityAndType } from '~/utils/sorts'
import { deleteOnCoudinary } from '~/config/cloudinary'
import CustomDate from '~/utils/customDate'

const createNew = async (data) => {
	try {

		const productParsed = {
			...data,
			quantity: parseInt(data.quantity),
			price: parseInt(data.price),
			savePercent: parseInt(data.savePercent)
		}

		const productCreated = await productModel.createNew(productParsed)
		const newProduct = await productModel.findOneById(productParsed.webId, productCreated.insertedId)

		return newProduct

	} catch (error) {
		throw error
	}
}

const getProductByPage = async (webId, page, limit, filterObj) => {
	try {
		const startIndex = (page - 1) * limit

		const data = await productModel.getProductByPage(webId, startIndex, limit, filterObj)

		if (!data) throw new ApiError(StatusCodes.NOT_FOUND, 'Products not found!')
		const product = { maxProductOfPage: limit, page, ...data }


		return product

	} catch (error) {
		throw error
	}
}

const findOneById = async (webId, id) => {
	try {

		const data = await productModel.findOneById(webId, id)

		if (!data) throw new ApiError(StatusCodes.NOT_FOUND, 'Products not found!')
		return data

	} catch (error) {
		throw error
	}
}
const getBestSeller = async (webId, type, number) => {
	try {

		const resuil = await productModel.getBestSeller(webId, type, parseInt(number))
		return resuil

	} catch (error) {
		throw error
	}
}



const update = async (productList) => {
	try {

		const product = await productModel.update(productList)

		if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'product not found!')

		return product

	} catch (error) {
		throw error
	}
}
// const moveCardToOtherColumn = async (data) => {
// 	try {
// 		await columnModel.update(data.oldColumnId, { cardOrderIds: data.oldCardOrderIds })

// 		await columnModel.update(data.newColumnId, { cardOrderIds: data.newCardOrderId })

// 		await cardModel.update(data.currentCardId, { columnId: data.newColumnId })

// 	} catch (error) {
// 		throw error
// 	}
// }
const updateDetail = async (data) => {
	try {
		let productDetail = {
			...data,
			price: parseInt(data.price),
			quantity: parseInt(data.quantity),
			savePercent: parseInt(data.savePercent),
			updatedAt: new CustomDate()
		}
		const product = await productModel.findOneById(data.webId, data._id)
		if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'product not found!')

		if (data.thumb === '') {
			productDetail = {
				...productDetail,
				thumb: product.thumb,
			}
		} else {
			deleteOnCoudinary(product.thumb)
			productDetail = {
				...productDetail,
				thumb: data.thumb
			}
		}
		const resuil = await productModel.updateDetail(productDetail)

		return resuil

	} catch (error) {
		throw error
	}
}
const deleteProduct = async (webId, id) => {
	try {
		const product = await productModel.findOneById(webId, id)
		deleteOnCoudinary(product.thumb)
		await productModel.deleteProduct(id)

		return { Deletemessage: 'Delete successfuly' }

	} catch (error) {
		throw error
	}
}
export const productService = {
	createNew,
	getProductByPage,
	update,
	findOneById,
	getBestSeller,
	updateDetail,
	deleteProduct
	// moveCardToOtherColumn
}
