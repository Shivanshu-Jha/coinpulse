export { cn } from "cn"

export const formatCurrency = (
	amount: number,
	currency = 'USD',
	locale = 'en-US',
): string =>
	new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
	}).format(amount)
