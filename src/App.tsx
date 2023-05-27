import { useState } from 'react'
import { TItemJSON, TItem5MFetch, TItem } from './assets/types'

import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.tz.setDefault('America/Denver')

import {
	LineChart,
	Line,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
} from 'recharts'

import __items from './assets/items.json'
const _items = __items as unknown
const items = _items as TItemJSON

import './App.css'

const currency = new Intl.NumberFormat()
const allItems = Object.keys(items)

function App() {
	const [searchTerm, setSearchTerm] = useState('')
	const [isModalOpen, setisModalOpen] = useState(false)
	const [currentItem, setCurrentItem] = useState<TItem5MFetch & TItem>()
	const [timeSelector, setTimeSelector] = useState('')
	const [itemHistory, setItemHistory] = useState<TItem[]>([])

	const filterItems = (searchTerm: string) =>
		allItems
			.filter((item) =>
				items[item].name.toUpperCase().includes(searchTerm.toUpperCase().trim())
			)
			.map((item) => (
				<p
					className='search-list'
					key={items[item].id}
					onClick={() => fetchItemData(items[item].id)}>
					{items[item].name}
				</p>
			))

	const fetchItemData = async (itemID: number) => {
		const response = await fetch(
			`http://prices.runescape.wiki/api/v1/osrs/timeseries?timestep=5m&id=${itemID}`
		)
		const data: TItem5MFetch = await response.json()
		console.log(data)
		setCurrentItem({ ...data, ...items[itemID] })
		if (!itemHistory.find((entry) => entry.id === itemID)) {
			setItemHistory((prev) => [items[itemID], ...prev])
		}
		setisModalOpen(true)
	}

	const closeModal = () => {
		setisModalOpen(false)
		setTimeSelector('12')
		setSearchTerm('')
	}

	return (
		<>
			<h1>OSRS GE Tracker</h1>
			{!isModalOpen && (
				<input
					type='text'
					placeholder='filter items'
					onChange={(e) => setSearchTerm(e.target.value)}
					value={searchTerm}
				/>
			)}
			{!isModalOpen && <button onClick={() => setSearchTerm('')}>clear</button>}
			{itemHistory.length > 0 && !isModalOpen && (
				<div className='history'>
					<h2>Item History</h2>
					{itemHistory.map((entry) => (
						<p
							className='search-list'
							key={entry.id}
							onClick={() => fetchItemData(entry.id)}>
							{entry.name}
						</p>
					))}
					<hr />
				</div>
			)}

			<div className='items-grid'>
				{!isModalOpen ? filterItems(searchTerm) : null}
			</div>
			{isModalOpen && currentItem ? (
				<div>
					<h3>{currentItem.name}</h3>
					<p>
						Current High Price:{' '}
						{currency.format(
							currentItem.data[currentItem.data.length - 1].avgHighPrice
						)}{' '}
						gp
					</p>
					<p>
						Current Low Price:{' '}
						{currency.format(
							currentItem.data[currentItem.data.length - 1].avgLowPrice
						)}{' '}
						gp
					</p>
					<p>High Alch value: {currency.format(currentItem.highalch)} gp</p>
					<p
						style={
							currentItem.highalch -
								currentItem.data[currentItem.data.length - 1].avgHighPrice >
							0
								? { color: 'green' }
								: { color: 'red' }
						}>
						Possible High Alch profit:{' '}
						{currency.format(
							currentItem.highalch -
								currentItem.data[currentItem.data.length - 1].avgHighPrice
						)}{' '}
						gp (minus cost of rune)
					</p>
					<div className='value-changes'>
						<p
							style={
								currentItem.data[currentItem.data.length - 1].avgHighPrice -
									currentItem.data[currentItem.data.length - 13].avgHighPrice >
								0
									? { color: 'red' }
									: { color: 'green' }
							}>
							1 hour high value change:{' '}
							{currency.format(
								currentItem.data[currentItem.data.length - 1].avgHighPrice -
									currentItem.data[currentItem.data.length - 13].avgHighPrice
							)}{' '}
							gp
						</p>
						<p
							style={
								currentItem.data[currentItem.data.length - 1].avgLowPrice -
									currentItem.data[currentItem.data.length - 13].avgLowPrice >
								0
									? { color: 'red' }
									: { color: 'green' }
							}>
							1 hour low value change:{' '}
							{currency.format(
								currentItem.data[currentItem.data.length - 1].avgLowPrice -
									currentItem.data[currentItem.data.length - 13].avgLowPrice
							)}{' '}
							gp
						</p>
						<p
							style={
								currentItem.data[currentItem.data.length - 1].avgHighPrice -
									currentItem.data[currentItem.data.length - 289].avgHighPrice >
								0
									? { color: 'red' }
									: { color: 'green' }
							}>
							24 hour high value change:{' '}
							{currency.format(
								currentItem.data[currentItem.data.length - 1].avgHighPrice -
									currentItem.data[currentItem.data.length - 289].avgHighPrice
							)}{' '}
							gp
						</p>
						<p
							style={
								currentItem.data[currentItem.data.length - 1].avgLowPrice -
									currentItem.data[currentItem.data.length - 289].avgLowPrice >
								0
									? { color: 'red' }
									: { color: 'green' }
							}>
							24 hour low value change:{' '}
							{currency.format(
								currentItem.data[currentItem.data.length - 1].avgLowPrice -
									currentItem.data[currentItem.data.length - 289].avgLowPrice
							)}{' '}
							gp
						</p>
					</div>
					<p>
						Last Updated{' '}
						{dayjs
							.unix(currentItem.data[currentItem.data.length - 1].timestamp)
							.tz()
							.format('MMM D, h:mm A')}
					</p>
					<label htmlFor='time selector'>Time Granularity </label>
					<select
						name='time selector'
						value={timeSelector}
						onChange={(e) => setTimeSelector(e.target.value)}>
						<option value='12'>1 Hour</option>
						<option value='36'>3 Hours</option>
						<option value='60'>5 Hours</option>
						<option value='144'>12 Hours</option>
						<option value='288'>24 Hours</option>
						<option value='365'>All</option>
					</select>
					<div className='chart'>
						<LineChart
							data={currentItem.data
								.slice(365 - parseInt(timeSelector))
								.map((entry) => {
									return {
										...entry,
										timestamp: dayjs.unix(entry.timestamp).tz().format('h:mma'),
									}
								})}
							width={1000}
							height={400}>
							<Line
								type='monotone'
								dataKey='avgHighPrice'
								stroke='#20ba4e'
								dot={false}
							/>
							<Line
								type='monotone'
								dataKey='avgLowPrice'
								stroke='#74138f'
								dot={false}
							/>
							<CartesianGrid strokeDasharray='3 3' />
							<YAxis domain={['dataMin - 1', 'dataMax + 1']} />
							<XAxis dataKey='timestamp' />
							<Tooltip />
							<Legend />
						</LineChart>
					</div>

					<button onClick={() => closeModal()}>Back</button>
				</div>
			) : null}
		</>
	)
}

export default App
