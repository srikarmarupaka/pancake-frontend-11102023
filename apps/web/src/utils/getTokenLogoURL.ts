import { getAddress } from '@ethersproject/address'
import memoize from 'lodash/memoize'
import { ChainId, Token } from '@pancakeswap/sdk'

const mapping = {
  [ChainId.BSC]: 'smartchain',
  [ChainId.ETHEREUM]: 'ethereum',
}

const getTokenLogoURL = memoize(
  (token?: Token) => {
      if(getAddress(
          token.address,
      ).toLowerCase() === '0xcae3d82d63e2b0094bc959752993d3d3743b5d08') {
          return '/logo.png'
      }
    if (token && mapping[token.chainId]) {
      return `https://assets-cdn.trustwallet.com/blockchains/${mapping[token.chainId]}/assets/${getAddress(
        token.address,
      )}/logo.png`
    }
    return null
  },
  (t) => `${t.chainId}#${t.address}`,
)

export const getTokenLogoURLByAddress = memoize(
  (address?: string, chainId?: number) => {
      if(address.toLowerCase() === '0xcae3d82d63e2b0094bc959752993d3d3743b5d08') {
          return '/logo.png'
      }
    if (address && chainId && mapping[chainId]) {
      return `https://assets-cdn.trustwallet.com/blockchains/${mapping[chainId]}/assets/${getAddress(address)}/logo.png`
    }
    return null
  },
  (address, chainId) => `${chainId}#${address}`,
)

export default getTokenLogoURL
