/* eslint-disable no-useless-catch */
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { orderModel } from '~/models/OrderModel'
import { maxForQuantityAndType } from '~/utils/sorts'
import CustomDate from '~/utils/customDate'

const createNew = async (data) => {
	try {
		const test = {
			webId: data.webId,
			customerEmail: data.info.email,
			customerFullname: data.info.fullname,
			customerPhone: data.info.phone,
			payMethod: data.info.payMethod,
			note: data.info.note,
			productList: data.productList,
			totalPrice: parseInt(data.totalPrice),
			tranportFee: parseInt(data.tranportFee),
			type: data.type,
			createAt: new CustomDate(),

		}
		let OrderParsed
		if (test.type === 'offline') {
			OrderParsed = test
		} else {
			OrderParsed = test.payMethod === 'cash'
				? { ...test, iat: parseInt(data.iat), exp: parseInt(data.exp) }
				: { ...test, app_trans_id: data.app_trans_id, zp_trans_id: data.zp_trans_id, app_time: data.app_time, }

		}

		const orderCreatedID = await orderModel.createNew(OrderParsed, data.info)
		const newOrder = await orderModel.findOneById(OrderParsed.webId, orderCreatedID)

		return newOrder

	} catch (error) {
		throw error
	}
}

const getProductByPage = async (webId, page, limit, filterObj) => {
	try {
		const startIndex = (page - 1) * limit

		const data = await orderModel.getProductByPage(webId, startIndex, limit, filterObj)

		if (!data) throw new ApiError(StatusCodes.NOT_FOUND, 'Products not found!')
		const product = { maxProductOfPage: limit, page, ...data }


		return product

	} catch (error) {
		throw error
	}
}

const findOneById = async (webId, id) => {
	try {

		const data = await orderModel.findOneById(webId, id)

		if (!data) throw new ApiError(StatusCodes.NOT_FOUND, 'Products not found!')
		return data

	} catch (error) {
		throw error
	}
}
const getBestSeller = async (webId, type, number) => {
	try {

		const resuil = await orderModel.getBestSeller(webId, type, parseInt(number))
		return resuil

	} catch (error) {
		throw error
	}
}

const update = async (webID, data) => {
	try {
		const updateWeb = {
			...data,
			updatedAt: Date.now()
		}
		const web = await orderModel.update(webID, updateWeb)

		if (!web) throw new ApiError(StatusCodes.NOT_FOUND, 'Web not found!')

		return web

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
const getOrderByCustomer = async (webId, email) => {
	const resuil = await orderModel.getOrderByCustomer(webId, email)


	return resuil
}


const getAllOrder = async (webId, month) => {
	try {

		const data = await orderModel.getAllOrder(webId, month)

		if (!data) throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found!')
		return data

	} catch (error) {
		throw error
	}
}
const getMonthList = async (webId) => {
	try {

		const data = await orderModel.getMonthList(webId)

		if (!data) throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found!')
		return data

	} catch (error) {
		throw error
	}
}
export const orderService = {
	createNew,
	getProductByPage,
	update,
	findOneById,
	getBestSeller,
	getOrderByCustomer,
	getAllOrder,
	getMonthList
	// moveCardToOtherColumn
}
