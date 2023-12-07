import React, { useMemo, useEffect, useState } from 'react'
import Page from 'components/Layout/Page'
import { Card } from '@pancakeswap/uikit'
import HoverableChart from 'views/Info/components/InfoCharts/HoverableChart'
import { useTokenChartDataSWR, useProtocolDataSWR, useTokenPriceDataSWR } from 'state/info/hooks'
import { BSC_TOKEN_WHITELIST, ONE_HOUR_SECONDS } from 'config/constants/info'
import BarChart from 'views/Info/components/InfoCharts/BarChart'
import LineChart from 'views/Info/components/InfoCharts/LineChart'

import { useTranslation } from '@pancakeswap/localization'
// import styled from 'styled-components'

// const StyledCard = styled(Card)`
//   height : 80vh;
// `

const BarChartComponent = () => {
  const [hover, setHover] = useState<number | undefined>()
  const [dateHover, setDateHover] = useState<string | undefined>()
  const DEFAULT_TIME_WINDOW: Duration = { weeks: 1 }
  const address = BSC_TOKEN_WHITELIST[1]
  const chartData = useTokenChartDataSWR(address)
  const priceData = useTokenPriceDataSWR(address, ONE_HOUR_SECONDS, DEFAULT_TIME_WINDOW)
  const protocolData = useProtocolDataSWR()

  useEffect(() => {
    setHover(null)
  }, [protocolData])

  useEffect(() => {
    if (hover == null && protocolData) {
      setHover(protocolData.volumeUSD)
    }
  }, [protocolData, hover])

  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()
  const currentDate = useMemo(
    () => new Date().toLocaleString(locale, { month: 'short', year: 'numeric', day: 'numeric' }),
    [locale],
  )
  useEffect(() => {
    setDateHover(currentDate)
  }, [currentDate])

  return (
    <Page>
      <Card>
        <HoverableChart
          chartData={priceData}
          protocolData={protocolData}
          currentDate={currentDate}
          valueProperty="priceUSD"
          title={t('Price Chart')}
          ChartComponent={LineChart}
          variant="price"
        />
      </Card>
    </Page>
  )
}

export default BarChartComponent
