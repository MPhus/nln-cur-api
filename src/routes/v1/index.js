import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { webRoute } from './WebRoute'
import { orderController } from '~/controllers/OrderController'
// import { columnRoute } from './columnRoute'
// import { cardRoute } from './cardRoute'

const Router = express.Router()

Router.get('/status', (req, res) => {
	res.status(StatusCodes.OK).json({ message: 'Index.js' })
})
Router.get('/verifyMail', orderController.verifyOrder)
Router.use('/web', webRoute)
// Router.use('/column', columnRoute)
// Router.use('/card', cardRoute)

export const APIs_V1 = Router
