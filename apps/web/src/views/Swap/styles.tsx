import { Box, Flex } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const StyledSwapContainer = styled(Flex)<{ $isChartExpanded: boolean, transparent: boolean }>`
  flex-shrink: 0;
  height: fit-content;
  padding: 0 24px;
  width: 100%;
  background: ${({transparent}) => (transparent ? 'transparent' : 'var(--bg-container)')};
  ${({ theme }) => theme.mediaQueries.lg} {
    padding: 0 40px;
  }

  ${({ theme }) => theme.mediaQueries.xxl} {
    ${({ $isChartExpanded }) => ($isChartExpanded ? 'padding: 0 120px' : 'padding: 0 40px')};
  }
`

export const StyledInputCurrencyWrapper = styled(Box)`
  min-width: 370px;
  width: 90%;
  max-width: 500px
`
