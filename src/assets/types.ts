export type TItem = {
	examine: string
	id: number
	members: boolean
	lowalch: number
	limit: number
	value: number
	highalch: number
	icon: string
	name: string
	price: number
	volume: number
	last: number
}

export type TItemJSON = {
	[key: string]: TItem
}

export type TItem5MFetch = {
	data: {
		avgHighPrice: number
		avgLowPrice: number
		highPriceVolume: number
		lowPriceVolume: number
		timestamp: number
	}[]
	itemId: number
}
