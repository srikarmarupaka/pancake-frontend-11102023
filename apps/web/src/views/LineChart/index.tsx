import React, { useMemo } from 'react'
import Page from 'components/Layout/Page'
import { Card, Flex, Heading } from '@pancakeswap/uikit'
import HoverableChart from 'views/Info/components/InfoCharts/HoverableChart'
import { useTokenChartDataSWR, useProtocolDataSWR } from 'state/info/hooks'
import { BSC_TOKEN_WHITELIST } from 'config/constants/info'
import LineChart from 'views/Info/components/InfoCharts/LineChart'
import { useTranslation } from '@pancakeswap/localization'
// import styled from 'styled-components'

// const StyledCard = styled(Card)`
//   height : 80vh;
// `

const LineChartComponent = () => {
  const address = BSC_TOKEN_WHITELIST[1]
  const chartData = useTokenChartDataSWR(address)
  const protocolData = useProtocolDataSWR()
  
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()
  const currentDate = useMemo(
    () => new Date().toLocaleString(locale, { month: 'short', year: 'numeric', day: 'numeric' }),
    [locale],
  )
  return (
    <Page>
      <Card>
        <HoverableChart
          chartData={chartData}
          protocolData={protocolData}
          currentDate={currentDate}
          valueProperty="liquidityUSD"
          title={t('Liquidity')}
          ChartComponent={LineChart}
        />
      </Card>
    </Page>
  )
}

export default LineChartComponent
