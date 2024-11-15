import { env } from '~/config/environment'
export const WHITELIST_DOMAIN = [
	'http://localhost:5173',
	'http://localhost:3000/v1/web/verifyMail',
	'https://49fa-2402-800-6343-ec8-35b5-2ecb-6da0-e9d3.ngrok-free.app'
]
export const PRODUCT_TYPE = {
	TOP: 'top',
	BOTTOM: 'bottom'
}
export const PAY_METHOD = {
	ZALOPAY: 'zaloPay',
	CASH: 'cash'
}
export const EMAIL_REGEX = /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/

