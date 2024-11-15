/* eslint-disable no-useless-catch */
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { productModel } from '~/models/ProductModel'
import { maxForQuantityAndType } from '~/utils/sorts'
import { customerModel } from '~/models/CustomerModel'

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

const getCustomerByPage = async (webId, page, limit, filterObj) => {
	try {
		const startIndex = (page - 1) * limit

		const data = await customerModel.getCustomerByPage(webId, startIndex, limit, filterObj)

		if (!data) throw new ApiError(StatusCodes.NOT_FOUND, 'Customer not found!')
		const customer = { maxCustomerOfPage: limit, page, ...data }


		return customer

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
export const customerService = {
	createNew,
	getCustomerByPage,
	update,
	findOneById,
	getBestSeller
	// moveCardToOtherColumn
}
