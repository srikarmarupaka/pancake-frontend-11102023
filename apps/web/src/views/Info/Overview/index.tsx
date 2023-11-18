import { useTranslation } from '@pancakeswap/localization'
import { Card, Flex, Heading } from '@pancakeswap/uikit'
import Page from 'components/Layout/Page'
import { useMemo } from 'react'
import {
  useAllTokenDataSWR,
  usePoolsForTokenSWR,
  useProtocolChartDataSWR,
  useProtocolDataSWR,
  useProtocolTransactionsSWR,
  useTokenChartDataSWR,
  useTokenTransactionsSWR,
} from 'state/info/hooks'
import styled from 'styled-components'
import BarChart from 'views/Info/components/InfoCharts/BarChart'
import LineChart from 'views/Info/components/InfoCharts/LineChart'
import PoolTable from 'views/Info/components/InfoTables/PoolsTable'
import TokenTable from 'views/Info/components/InfoTables/TokensTable'
import TransactionTable from 'views/Info/components/InfoTables/TransactionsTable'
import { BSC_TOKEN_WHITELIST } from 'config/constants/info'
import HoverableChart from '../components/InfoCharts/HoverableChart'
import { usePoolsData } from '../hooks/usePoolsData'

export const ChartCardsContainer = styled(Flex)`
  justify-content: space-between;
  flex-direction: column;
  width: 100%;
  padding: 0;
  gap: 1em;

  & > * {
    width: 100%;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
  }
`

const Overview: React.FC<React.PropsWithChildren> = () => {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()

  const address = BSC_TOKEN_WHITELIST[1];
  const protocolData = useProtocolDataSWR()
  const transactions = useTokenTransactionsSWR(address)
  const chartData = useTokenChartDataSWR(address)

  const currentDate = useMemo(
    () => new Date().toLocaleString(locale, { month: 'short', year: 'numeric', day: 'numeric' }),
    [locale],
  )

  const allTokens = useAllTokenDataSWR()

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens)
      .map((token) => token.data)
      .filter((token) => token.name !== 'unknown')
  }, [allTokens])

  const { poolsData } = usePoolsData()

  const filteredPoolsData = poolsData?.filter((pool) => pool.token0.symbol === 'BTAF' || pool.token1.symbol === 'BTAF')
  const filteredFormattedTokens = formattedTokens?.filter((token) => token.symbol === 'BTAF' || token.symbol === 'BTAF')
  const filteredTransactions = transactions?.filter((txn) => txn.token0Symbol === 'BTAF' || txn.token1Symbol === 'BTAF')
  
  const somePoolsAreLoading = useMemo(() => {
    return filteredPoolsData.some((pool) => !pool?.token0Price)
  }, [filteredPoolsData])
  // const somePoolsAreLoading = useMemo(() => {
  //   return poolsData.some((pool) => !pool?.token0Price)
  // }, [poolsData])

  return (
    <Page>
      <Heading scale="xl" mb="16px" id="info-overview-title">
        {t('Info & Analytics')}
      </Heading>
      <ChartCardsContainer>
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
        <Card>
          <HoverableChart
            chartData={chartData}
            protocolData={protocolData}
            currentDate={currentDate}
            valueProperty="volumeUSD"
            title={t('Volume 24H')}
            ChartComponent={BarChart}
          />
        </Card>
      </ChartCardsContainer>
      {/* <Heading scale="lg" mt="40px" mb="16px">
        {t('Top Tokens')}
      </Heading> */}
      <TokenTable tokenDatas={formattedTokens} />
      {/* <Heading scale="lg" mt="40px" mb="16px">
        {t('Top Pools')}
      </Heading> */}
      <PoolTable poolDatas={poolsData} loading={somePoolsAreLoading} />
      {/* <PoolTable poolDatas={poolsData} loading={somePoolsAreLoading} /> */}
      {/* <Heading scale="lg" mt="40px" mb="16px">
        {t('Transactions')}
      </Heading> */}
      <TransactionTable transactions={filteredTransactions} />
    </Page>
  )
}

export default Overview
