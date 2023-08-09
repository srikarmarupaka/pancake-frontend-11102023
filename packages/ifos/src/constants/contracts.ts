import { ChainId } from '@pancakeswap/sdk'
import { Address } from 'viem'

import { ProfileSupportedChainId, SupportedChainId } from './supportedChains'

export type ContractAddresses<T extends ChainId = SupportedChainId> = {
  [chainId in T]: Address
}

export const ICAKE = {
  [ChainId.BSC]: '0x3C458828D1622F5f4d526eb0d24Da8C4Eb8F07b1',
  [ChainId.POLYGON_ZKEVM]: '0xD5Fd22852EBA812580aa26ed48FD50b1A07D248e',
} as const satisfies ContractAddresses<SupportedChainId>

// Used to send cross chain message
// Name derived from smart contract
export const INFO_SENDER = {
  [ChainId.BSC]: '0x189bD3C6e124951F01d34800e85196eF0F0F5D4a',
} as const satisfies ContractAddresses<ProfileSupportedChainId>
