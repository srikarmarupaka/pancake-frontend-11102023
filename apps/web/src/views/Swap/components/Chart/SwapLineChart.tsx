import { useRef, useState, useEffect, Dispatch, SetStateAction, useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { createChart, IChartApi, UTCTimestamp } from 'lightweight-charts'
import { format } from 'date-fns'
import { LineChartLoader } from 'components/ChartLoaders'
import useTheme from 'hooks/useTheme'
import { PairDataTimeWindowEnum } from 'state/swap/types'
import { lightColors, darkColors } from '@pancakeswap/ui/tokens/colors'

export type SwapLineChartNewProps = {
  data: any[]
  setHoverValue?: Dispatch<SetStateAction<number | undefined>> // used for value on hover
  setHoverDate?: Dispatch<SetStateAction<string | undefined>> // used for value label on hover
  isChangePositive: boolean
  isChartExpanded: boolean
  timeWindow: PairDataTimeWindowEnum
} & React.HTMLAttributes<HTMLDivElement>

const getChartColors = ({ isChangePositive }) => {
  return isChangePositive
    ? { gradient1: '#F888C0', gradient2: '#FFF', stroke: '#FB8EC4' }
    : { gradient1: '#F888C0', gradient2: '#FFF', stroke: '#FB8EC4 ' }
}

const dateFormattingByTimewindow: Record<PairDataTimeWindowEnum, string> = {
  [PairDataTimeWindowEnum.DAY]: 'h a',
  [PairDataTimeWindowEnum.WEEK]: 'MMM dd',
  [PairDataTimeWindowEnum.MONTH]: 'MMM dd',
  [PairDataTimeWindowEnum.YEAR]: 'MMM dd',
}

const SwapLineChart = ({
  data,
  setHoverValue,
  setHoverDate,
  isChangePositive,
  isChartExpanded,
  timeWindow,
  ...rest
}: SwapLineChartNewProps) => {
  const { isDark } = useTheme()
  const transformedData = useMemo(() => {
    return (
      data?.map(({ time, value }) => {
        return { time: Math.floor(time.getTime() / 1000) as UTCTimestamp, value }
      }) || []
    )
  }, [data])
  const {
    currentLanguage: { locale },
  } = useTranslation()
  const chartRef = useRef<HTMLDivElement>(null)
  const colors = useMemo(() => {
    return getChartColors({ isChangePositive })
  }, [isChangePositive])
  const [chartCreated, setChart] = useState<IChartApi | undefined>()

  useEffect(() => {
    const handleResize = () => {
      chart.applyOptions({ width: chartRef.current.clientWidth, height: chartRef.current.clientHeight })
    }

    const chart = createChart(chartRef.current, {
      layout: {
        background: { color: 'white' },
        textColor: '#FB8EC4FF',
      },
      handleScale: false,
      handleScroll: false,
      width: chartRef.current.parentElement.clientWidth - 32,
      height: chartRef.current.parentElement.clientHeight - 32,
      rightPriceScale: {
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        borderVisible: false,
      },
      timeScale: {
        visible: true,
        borderVisible: false,
        secondsVisible: false,
        tickMarkFormatter: (unixTime: number) => {
          return format(unixTime * 1000, dateFormattingByTimewindow[timeWindow])
        },
      },
      grid: {
        horzLines: {
          visible: false,
        },
        vertLines: {
          visible: true,
          color: 'pink',
          style: 3,
        },
      },
      crosshair: {
        horzLine: {
          visible: true,
          labelVisible: true,
        },
        mode: 1,
        vertLine: {
          visible: true,
          labelVisible: false,
          style: 3,
          width: 1,
          color: isDark ? '#B8ADD2' : '#7A6EAA',
        },
      },
    })
    const newSeries = chart.addAreaSeries({
      lineWidth: 4,
      lineColor: colors.gradient1,
      topColor: colors.gradient1,
      bottomColor: colors.gradient2,
    })
    setChart(chart)
    newSeries.setData(transformedData)
    chart.timeScale().fitContent()

    chart.subscribeCrosshairMove((param) => {
      if (newSeries && param && param.seriesPrices.size) {
        const timestamp = param.time as number
        const now = new Date(timestamp * 1000)
        const time = `${now.toLocaleString(locale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          // minute: '2-digit',
          timeZone: 'UTC',
        })} (UTC)`
        const parsed = param.seriesPrices.get(newSeries) as number | undefined
        if (setHoverValue) setHoverValue(parsed)
        if (setHoverDate) setHoverDate(time)
      } else {
        if (setHoverValue) setHoverValue(undefined)
        if (setHoverDate) setHoverDate(undefined)
      }
    })

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [transformedData, isDark, colors, isChartExpanded, locale, timeWindow, setHoverDate, setHoverValue])

  return (
    <>
      {!chartCreated && <LineChartLoader />}
      <div ref={chartRef} id="swap-line-chart" {...rest} />
    </>
  )
}

export default SwapLineChart
