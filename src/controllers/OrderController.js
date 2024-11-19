import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import nodemailer from 'nodemailer'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import moment from 'moment'
import { JwtProvider } from '~/providers/JwtProvider'
import qs from 'qs'
import ApiError from '~/utils/ApiError'
import { orderService } from '~/services/OrderService'
import { productService } from '~/services/ProductService'
import { webModel } from '~/models/WebModel'
import CustomDate from '~/utils/customDate'

const ZALOPAY_CONFIG = {
	app_id: env.ZALOPAY_APP_ID,
	key1: env.ZALOPAY_KEY1,
	key2: env.ZALOPAY_KEY2,
	payMentPageEndpoint: env.ZALOPAY_PAYMENT_PAGE_ENDPOINT,
	orderStatusEndpoint: env.ZALOPAY_ORDER_STATUS_ENDPOINT
}

const createNewCustomerOrder = async (req, res, next) => {
	try {
		const webId = req.body.productList[0].webId
		const dataSendmail = { ...req.body, webId }
		// console.log('dataSendmail: ', dataSendmail)
		const dataSaveDatabase = { ...dataSendmail, productList: dataSendmail.productList.map(item => { return { productID: item._id, quantity: item.quantityInCart } }) }

		const emailToken = await JwtProvider.generateToken(dataSaveDatabase, env.ORDER_TOKEN_SECRET_SIGNATURE, '300s')
		const test2 = `http://${env.LOCAL_DEV_HOST}:${env.LOCAL_DEV_FORNTEND_PORT}/verifyMail/${emailToken}`
		const htmlMail = dataSendmail.productList.map((item) => {
			return `
			<div style="min-width:320px; max-width: 320px;padding:8px 20px" >
				<h3 style="text-align: center;">${item.name}</h3>
				<img style="min-width:320px; max-width: 320px;" src=${item.thumb} alt=${item.name} />
				<h3>Giá thành: ${new Intl.NumberFormat().format(item.price * 1000)} vnd</h3>
				<h3>Số lượng: ${item.quantityInCart}</h3>
			</div>
			`
		}).join('')

		const transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			port: 587,
			secure: false,
			auth: {
				user: env.EMAIL,
				pass: env.APP_PASSWORK,
			},
		})

		const mailOption = {
			from: {
				name: 'Rho Web',
				address: env.EMAIL
			},
			to: dataSendmail.info.email,
			subject: 'Xác nhận đơn hàng',
			html: `
			<h1>Đơn hàng của bạn đã đặt thành công</h1>
			<div style="background-color: #000; color:#fff !important; padding: 20px;">
			<h2>Thông tin về đơn hàng</h2>
				<div style="display: flex; gap:20px;  justify-content: space-around;">
				<h1></h1>
				${htmlMail}
				</div>
				<div style="display: flex; box-sizing: border-box;">
					<div style="margin-right: 40px;">
						<h2>
						Giá trị đơn hàng: ${new Intl.NumberFormat().format((dataSendmail.totalPrice * 1000))} VND
						</h2>
						<h3>
						Phí vận chuyển: ${new Intl.NumberFormat().format((dataSendmail.tranportFee * 1000))} VND
						</h3>
						<h1>
						Tổng cộng: ${new Intl.NumberFormat().format(((dataSendmail.totalPrice + dataSendmail.tranportFee) * 1000))} VND
						</h1>
					</div>

					<a href=${test2}
					style="background-color: #4f6f52; color: #fff; padding: 20px; margin-top: 40px; line-height: 40px; text-decoration: none; font-size: large; font-weight: 700; max-height: 40px;">Click
					vào đây
					để xác
					nhận đơn hàng của
					bạn</a>
				</div>
			</div>
			`
		}

		const test3 = await transporter.sendMail(mailOption)
		if (!test3) throw new ApiError(StatusCodes.NOT_FOUND, 'Error')
		// const createdOrder = await webService.createNew(req.body)

		res.status(StatusCodes.OK).json(test3.envelope)


	}
	catch (err) {
		next(err)
	}
}
// const getBankList = async (req, res, next) => {
// 	try {
// 		// const dataSendmail = { ...req.body, createAt: new CustomDate() }
// 		// const dataSaveDatabase = { ...dataSendmail, productList: dataSendmail.productList.map(item => { return { productID: item._id, quantity: item.quantityInCart } }) }

// 		const config = {
// 			appid: '2553',
// 			key1: 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
// 			key2: 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
// 			endpoint: 'https://sbgateway.zalopay.vn/api/getlistmerchantbanks'
// 		}

// 		// const embed_data = { 'preferred_payment_method': [] }
// 		// const items = dataSendmail.productList
// 		// const transID = Math.floor(Math.random() * 1000000)
// 		let reqtime = Date.now()

// 		let params = {
// 			appid: config.appid,
// 			reqtime: reqtime, // miliseconds
// 			mac: CryptoJS.HmacSHA256(config.appid + '|' + reqtime, config.key1).toString() // appid|reqtime
// 		}


// 		const test = await axios.get(config.endpoint, { params })
// 		res.status(StatusCodes.OK).json(test.data)
// 	}
// 	catch (err) {
// 		next(err)
// 	}
// }
const verifyOrder = async (req, res, next) => {
	try {
		const orderTokenDecoded = await JwtProvider.verifyToken(req.query.token, env.ORDER_TOKEN_SECRET_SIGNATURE)
		// if (orderTokenDecoded) res.status(StatusCodes.CREATED).json({ data: orderTokenDecoded, message: 'Is valid' })
		if (!orderTokenDecoded) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Error')

		const orderCreated = await orderService.createNew(orderTokenDecoded)

		if (!orderCreated) throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')

		const newProduct = await productService.update(orderTokenDecoded.productList)
		if (!newProduct) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found in controler')
		// res.status(StatusCodes.CREATED).json(orderCreated)
		res.status(StatusCodes.CREATED).json({ data: orderTokenDecoded, message: 'Is valid' })
	} catch (error) {
		next(error)
	}
}
// const getCustomeOrder = async (req, res, next) => {
// 	try {
// 		// // console.log('req.body', req.body)
// 		// const createdWeb = await webService.createNew(req.body)
// 		// res.status(StatusCodes.CREATED).json(createdWeb)
// 	}
// 	catch (err) {
// 		next(err)
// 	}
// }
const createNewOrderEmployee = async (req, res, next) => {
	const webId = req.body.productList[0].webId
	// console.log('dataSendmail: ', dataSendmail)

	const data = {
		...req.body,
		webId
	}
	const dataSaveDatabase = { ...data, productList: data.productList.map(item => { return { productID: item._id, quantity: item.quantityInCart } }) }

	const orderCreated = await orderService.createNew(dataSaveDatabase)
	if (!orderCreated) throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')
	const newProduct = await productService.update(data.productList)
	if (!newProduct) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found in controler')
	res.status(StatusCodes.CREATED).json(orderCreated)
	// res.status(StatusCodes.CREATED).json({ data: orderTokenDecoded, message: 'Is valid' })

}

const getPaymentPage = async (req, res, next) => {
	try {
		const webId = req.body.productList[0].webId
		const dataSendmail = { ...req.body, webId }
		const dataSaveDatabase = { ...dataSendmail, productList: dataSendmail?.productList?.map(item => { return { productID: item._id, quantity: item.quantityInCart } }) }
		// const info = {
		// 	webId,
		// 	customerEmail: dataSaveDatabase.info.email,
		// 	customerFullname: dataSaveDatabase.info.fullname,
		// 	customerPhone: dataSaveDatabase.info.phone,
		// 	payMethod: dataSaveDatabase.info.payMethod,
		// 	totalPrice: dataSaveDatabase.totalPrice,
		// 	note: dataSaveDatabase.info.note,
		// 	tranportFee: dataSaveDatabase.tranportFee
		// }
		const embed_data = {
			dataSaveDatabase,
			redirecturl: `http://${env.LOCAL_DEV_HOST}:${env.LOCAL_DEV_FORNTEND_PORT}/verifyMail/zaloPaySuccess`
		}

		const items = dataSaveDatabase.productList ? dataSaveDatabase.productList : [{}]
		const transID = Math.floor(Math.random() * 1000000)

		const order = {
			app_id: ZALOPAY_CONFIG.app_id,
			app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
			app_user: 'user123',
			app_time: Date.now(), // miliseconds
			item: JSON.stringify(items),
			embed_data: JSON.stringify(embed_data),
			amount: (dataSaveDatabase.totalPrice + dataSaveDatabase.tranportFee) * 1000,
			description: `TiemCUR_Payment for the order #${transID}`,
			bank_code: '',
			callback_url: 'https://b4df-2402-800-6343-34d1-ec61-4205-5ad1-4792.ngrok-free.app/v1/web/tiemcur/order/zaloCallback'
		};
		const data = order.app_id + '|' + order.app_trans_id + '|' + order.app_user + '|' + order.amount + '|' + order.app_time + '|' + order.embed_data + '|' + order.item;
		order.mac = CryptoJS.HmacSHA256(data, ZALOPAY_CONFIG.key1).toString()
		const test = await axios.post(ZALOPAY_CONFIG.payMentPageEndpoint, null, { params: order })


		res.status(StatusCodes.OK).json(test.data)
	}
	catch (err) {
		next(err)
	}
}
const zaloCallback = async (req, res) => {
	let result = {}

	try {
		let dataStr = req.body.data
		let reqMac = req.body.mac

		let mac = CryptoJS.HmacSHA256(dataStr, ZALOPAY_CONFIG.key2).toString()


		if (reqMac !== mac) {
			result.returncode = -1
			result.returnmessage = 'mac not equal'
		}
		else {
			let dataJson = JSON.parse(dataStr, ZALOPAY_CONFIG.key2)
			const dataSaved = JSON.parse(dataJson.embed_data).dataSaveDatabase
			const OrderParsed = {
				...dataSaved,
				app_trans_id: dataJson.app_trans_id,
				zp_trans_id: dataJson.zp_trans_id,
				app_time: dataJson.app_time,
			}
			const orderCreated = await orderService.createNew(OrderParsed)

			if (!orderCreated) throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')
			const newProduct = await productService.update(OrderParsed.productList)
			if (!newProduct) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found in controler')

			result.returncode = 1
			result.returnmessage = 'success'
		}
	} catch (ex) {
		result.returncode = 0
		result.returnmessage = ex.message
	}
	console.log('result: ', result)
	res.json(result)

}
const orderStatus = async (req, res) => {
	const { apptransid } = req.query
	let postData = {
		app_id: ZALOPAY_CONFIG.app_id,
		app_trans_id: apptransid
	}

	let data = postData.app_id + '|' + postData.app_trans_id + '|' + ZALOPAY_CONFIG.key1
	postData.mac = CryptoJS.HmacSHA256(data, ZALOPAY_CONFIG.key1).toString()


	let postConfig = {
		method: 'post',
		url: ZALOPAY_CONFIG.orderStatusEndpoint,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		data: qs.stringify(postData)
	}

	try {
		const resuil = await axios(postConfig)
		return res.status(StatusCodes.CREATED).json(resuil.data)
	} catch (error) {
		console.log(error)
	}
}
const getOrderByCustomer = async (req, res, next) => {
	try {
		const { webId, email } = req.query
		const resuil = await orderService.getOrderByCustomer(webId, email)
		if (!resuil) throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')
		res.status(StatusCodes.OK).json(resuil)
	} catch (error) {
		next(error)
	}
}
const getAllOrder = async (req, res, next) => {
	try {
		const { month } = req.query
		const web = await webModel.getDetail(req.params.slug)
		const resuil = await orderService.getAllOrder(web._id.toString(), parseInt(month))
		if (!resuil) throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')
		res.status(StatusCodes.OK).json(resuil)
	} catch (error) {
		next(error)
	}
}
const getMonthList = async (req, res, next) => {
	try {
		const web = await webModel.getDetail(req.params.slug)
		const resuil = await orderService.getMonthList(web._id.toString())
		if (!resuil) throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')
		res.status(StatusCodes.OK).json(resuil)
	} catch (error) {
		next(error)
	}
}
export const orderController = {
	createNewCustomerOrder,
	//getCustomeOrder,
	verifyOrder,
	// getBankList,
	getOrderByCustomer,
	getPaymentPage,
	zaloCallback,
	orderStatus,
	getAllOrder,
	getMonthList,
	createNewOrderEmployee
}
