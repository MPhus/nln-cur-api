import { env } from '~/config/environment'
export const WHITELIST_DOMAIN = [
	'http://localhost:5173',
	'http://localhost:3000/v1/web/verifyMail',
	env.PUBLIC_HOST
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

