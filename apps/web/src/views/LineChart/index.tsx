import React, { useMemo } from 'react'
import Page from 'components/Layout/Page'
import { Card, Flex, Heading } from '@pancakeswap/uikit'
import HoverableChart from 'views/Info/components/InfoCharts/HoverableChart'
import { useTokenChartDataSWR, useProtocolDataSWR } from 'state/info/hooks'
import { BSC_TOKEN_WHITELIST } from 'config/constants/info'
import LineChart from 'views/Info/components/InfoCharts/LineChart'
import { useTranslation } from '@pancakeswap/localization'
import {Currency} from "@pancakeswap/swap-sdk-core";
import PriceChartContainer from "../Swap/components/Chart/PriceChartContainer";
import {Field} from "../../state/swap/actions";
import {useSingleTokenSwapInfo, useSwapState} from "../../state/swap/hooks";
import {useCurrency} from "../../hooks/Tokens";
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

  const inputCurrencyId = 'BNB';
  const outputCurrencyId = '0xcAE3d82D63e2b0094bc959752993D3D3743B5D08';
  console.log('inputCurrencyId', inputCurrencyId, outputCurrencyId)
  const inputCurrency = useCurrency('BNB')
  const outputCurrency = useCurrency('0xcAE3d82D63e2b0094bc959752993D3D3743B5D08')

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined,
  }

  const singleTokenPrice = useSingleTokenSwapInfo(
      inputCurrencyId,
      inputCurrency,
      outputCurrencyId,
      outputCurrency,
  )
  return (
    <Page>
      <Card>
        <PriceChartContainer
            inputCurrencyId={inputCurrencyId}
            inputCurrency={currencies[Field.INPUT]}
            outputCurrencyId={outputCurrencyId}
            outputCurrency={currencies[Field.OUTPUT]}
            isChartExpanded
            setIsChartExpanded={() => {}}
            currentSwapPrice={singleTokenPrice}
            isChartDisplayed
        />
      </Card>
    </Page>
  )
}

export default LineChartComponent
