import { Box, Text, Skeleton } from '@pancakeswap/uikit'
import { fromUnixTime } from 'date-fns'
import { useState, useMemo, memo, useEffect } from 'react'
import { ChartEntry, PriceChartEntry, ProtocolData } from 'state/info/types'
import { formatAmount } from 'utils/formatInfoNumbers'
import { ONE_HOUR_SECONDS, BSC_TOKEN_WHITELIST } from 'config/constants/info'
import { useTokenPriceDataSWR, useTokenDataSWR } from 'state/info/hooks'
import BarChart from './BarChart'
import LineChart from './LineChart'
import CandleChart from './CandleChart'

interface HoverableChartProps {
  variant?: string
  chartData: ChartEntry[] | PriceChartEntry[]
  protocolData: ProtocolData
  currentDate: string
  valueProperty: string
  title: string
  ChartComponent: typeof BarChart | typeof LineChart | typeof CandleChart
}

const HoverableChart = ({
  variant,
  chartData,
  protocolData,
  currentDate,
  valueProperty,
  title,
  ChartComponent,
}: HoverableChartProps) => {
  const [hover, setHover] = useState<number | undefined>()
  const [dateHover, setDateHover] = useState<string | undefined>()
  const DEFAULT_TIME_WINDOW: Duration = { weeks: 1 }
  const address = BSC_TOKEN_WHITELIST[1]
  // const priceData = useTokenPriceDataSWR(address, ONE_HOUR_SECONDS, DEFAULT_TIME_WINDOW)
  const tokenData = useTokenDataSWR(address)
  // console.log({ chartData })

  // const adjustedPriceData = useMemo(() => {
  //   if (priceData && tokenData && priceData.length > 0) {
  //     return [
  //       ...priceData,
  //       {
  //         time: Date.now() / 1000,
  //         open: priceData[priceData.length - 1].close,
  //         close: tokenData?.priceUSD,
  //         high: tokenData?.priceUSD,
  //         low: priceData[priceData.length - 1].close,
  //       },
  //     ]
  //   }
  //   return undefined
  // }, [priceData, tokenData])

  // Getting latest data to display on top of chart when not hovered
  useEffect(() => {
    setHover(null)
  }, [tokenData])

  useEffect(() => {
    if (hover == null && tokenData) {
      setHover(tokenData[valueProperty])
    }
  }, [tokenData, hover, valueProperty])

  const formattedData = useMemo(() => {
    if (chartData) {
      if (variant === 'price') {
        return chartData.map((day) => {
          return {
            time: fromUnixTime(day.time),
            value: day.close,
          }
        })
      }
      return chartData.map((day) => {
        return {
          time: fromUnixTime(day.date),
          value: day[valueProperty],
        }
      })
    }
    return []
  }, [chartData, valueProperty])

  return (
    <Box p={['16px', '16px', '24px']}>
      <Text bold color="secondary">
        {title}
      </Text>
      {hover > -1 ? ( // sometimes data is 0
        <Text bold fontSize="24px">
          ${formatAmount(hover)}
        </Text>
      ) : (
        <Skeleton width="128px" height="36px" />
      )}
      <Text>{dateHover ?? currentDate}</Text>
      <Box height='250px'>
        {/* {variant === 'candlechart' ? (
          <CandleChart data={adjustedPriceData} setValue={setHover} setLabel={setDateHover} />
        ) : (
          <></>
          )} */}
        <ChartComponent data={formattedData} setHoverValue={setHover} setHoverDate={setDateHover} />
      </Box>
    </Box>
  )
}

export default memo(HoverableChart)
