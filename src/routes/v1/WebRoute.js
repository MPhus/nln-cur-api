import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { webController } from '~/controllers/WebController'
import { productController } from '~/controllers/ProductController'
import { upload } from '~/config/cloudinary'
import { ProductValidation } from '~/validations/productValidation'
import { otherPageValidation } from '~/validations/otherPageValidation'
import { orderController } from '~/controllers/OrderController'
import { orderValidation } from '~/validations/orderValidation'
import { customerController } from '~/controllers/CustomerController'
import { userController } from '~/controllers/UserController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
	.get((req, res) => {
		res.status(StatusCodes.OK).json({ message: 'GET' })
	})
// 	.post(broadValidation.createNew, broadController.createNew)
Router.route('/:slug')
	.get(webController.getHomePage)
	.put(upload.fields([{ name: 'thumbShirt' }, { name: 'thumbPant' }]), webController.updateHomePage)

Router.route('/:slug/users/login')
	.post(userController.login)

Router.route('/:slug/users')
	.get(userController.getAllUser)
	.post(userController.createNew)
	.put(userController.updateDetailPassword)
	.delete(userController.deleteUser)

Router.route('/:slug/users/:id')
	.get(userController.getUserById)

Router.route('/:slug/accesstoken')
	.get(authMiddleware.isAuthorized, userController.accessToken)
Router.route('/:slug/users/logout')
	.delete(userController.logout)
Router.route('/:slug/users/refresh_token')
	.put(userController.refreshToken)

Router.route('/:slug/products')
	.get(productController.getProductByPage)
	.post(upload.single('thumb'), ProductValidation.createNew, productController.createNew)
	.put(upload.single('thumb'), ProductValidation.updateDetail, productController.updateDetail)
	.delete(productController.deleteProduct)

Router.route('/:slug/products/detail')
	.get(productController.findOneById)

Router.route('/:slug/products/bestSeller')
	.get(productController.getBestSeller)

Router.route('/:slug/other')
	.get(webController.getOtherPage)
	.post(webController.createOtherPage)
	.put(webController.moveNewsOnOtherPage)

Router.route('/:slug/other/news')
	.post(upload.single('thumb'), webController.createNewsOnOtherPage)
	.put(upload.single('thumb'), webController.updateNews)

Router.route('/:slug/other/news/:id')
	.delete(webController.deleteNews)

Router.route('/:slug/other/slide')
	// .post(upload.single('thumb'), webController.createNewsOnOtherPage)
	.put(upload.single('thumb'), webController.updateSlide)
Router.route('/:slug/other/slide/:id')
	.delete(webController.deleteNews)

Router.route('/:slug/store')
	.get(webController.getStorePage)

Router.route('/:slug/order')
	.post(orderValidation.createNew, orderController.createNewCustomerOrder)
Router.route('/:slug/order/offline')
	.post(orderController.createNewOrderEmployee)
// .get(orderController.getCustomeOrder)

Router.route('/:slug/order/zalopay')
	// .post(orderValidation.createNew, orderController.getBankList)
	.post(orderValidation.createNew, orderController.getPaymentPage)

Router.route('/:slug/order/zaloCallback')
	.post(orderController.zaloCallback)
Router.route('/:slug/order/orderStatus')
	.post(orderController.orderStatus)
Router.route('/:slug/order/getByCustomer')
	.get(orderController.getOrderByCustomer)

Router.route('/:slug/customers')
	.get(customerController.getCustomerByPage)
Router.route('/:slug/order/getMonthList')
	.get(orderController.getMonthList)
Router.route('/:slug/order/test')
	.get(orderController.getAllOrder)

export const webRoute = Router
