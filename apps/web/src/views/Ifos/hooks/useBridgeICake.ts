import { useMemo, useState, useCallback, useEffect } from 'react'
import { ChainId, CurrencyAmount, Currency } from '@pancakeswap/sdk'
import {
  INFO_SENDER,
  getCrossChainMessageUrl,
  CrossChainMessage,
  getBridgeICakeGasFee,
  getCrossChainMessage,
  pancakeInfoSenderABI,
  getLayerZeroChainId,
  MessageStatus,
} from '@pancakeswap/ifos'
import { useAccount } from 'wagmi'
import { Hash } from 'viem'
import localforage from 'localforage'
import { useQuery } from '@tanstack/react-query'

import { getBlockExploreLink } from 'utils'
import { getViemClients } from 'utils/viem'
import { useContract } from 'hooks/useContract'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { useTransactionAdder } from 'state/transactions/hooks'

import { useChainName } from './useChainNames'

export enum BRIDGE_STATE {
  // Before start bridging
  INITIAL,

  // Pending user sign tx on wallet
  PENDING_WALLET_SIGN,

  // Sending tx on source chain
  PENDING_SOURCE_CHAIN_TX,

  // After getting receipt on source chain,
  // while pending tx on destination chain
  PENDING_CROSS_CHAIN_TX,

  // After message got confirmed on destination chain
  FINISHED,
}

export type BaseBridgeState = {
  state: BRIDGE_STATE.INITIAL | BRIDGE_STATE.PENDING_WALLET_SIGN | BRIDGE_STATE.PENDING_SOURCE_CHAIN_TX
}

export type PendingCrossChainState = {
  state: BRIDGE_STATE.PENDING_CROSS_CHAIN_TX
} & CrossChainMessage

export type BridgeSuccessState = {
  state: BRIDGE_STATE.FINISHED
} & CrossChainMessage

export type BridgeState = BaseBridgeState | PendingCrossChainState | BridgeSuccessState

const INITIAL_BRIDGE_STATE: BridgeState = {
  state: BRIDGE_STATE.INITIAL,
  // srcUaAddress: '0x39061b58ecb2df82b5886528d77b3094179ce292',
  // srcChainId: ChainId.BSC,
  // srcUaNonce: 1,
  // dstChainId: ChainId.POLYGON_ZKEVM,
  // dstUaAddress: '0xe5de11958969e75c57e5708651a49f0cf3f34d13',
  // dstTxHash: '0x8617b7ef9569113b09befdc0f11bd18caa912e3f68f38999a179cdb80fd96f77',
}

type Params = {
  srcChainId: ChainId
  ifoChainId: ChainId
  icake?: CurrencyAmount<Currency>
}

export function useBridgeICake({ srcChainId, ifoChainId, icake }: Params) {
  const [signing, setSigning] = useState(false)
  const sourceChainName = useChainName(srcChainId)
  const ifoChainName = useChainName(ifoChainId)
  const { address: account } = useAccount()
  const { callWithGasPrice } = useCallWithGasPrice()
  const addTransaction = useTransactionAdder()
  const infoSender = useContract(INFO_SENDER, pancakeInfoSenderABI, { chainId: srcChainId })
  const { receipt, saveTransactionHash, clearTransactionHash, txHash } = useLatestBridgeTx(srcChainId)
  const message = useCrossChainMessage({ txHash: receipt?.transactionHash, srcChainId })

  const bridge = useCallback(async () => {
    if (!account) {
      return
    }

    try {
      setSigning(true)
      const gasEstimate = await getBridgeICakeGasFee({
        srcChainId,
        dstChainId: ifoChainId,
        account,
        provider: getViemClients,
      })
      const txReceipt = await callWithGasPrice(infoSender, 'sendSyncMsg', [account, getLayerZeroChainId(ifoChainId)], {
        value: gasEstimate.quotient,
      })
      setSigning(false)
      saveTransactionHash(txReceipt.hash)
      const summary = `Bridge ${icake?.toExact()} iCAKE from ${sourceChainName} to ${ifoChainName}`
      addTransaction(txReceipt, {
        summary,
        translatableSummary: {
          text: 'Bridge %icakeAmount% iCAKE from %srcChain% to %ifoChain%',
          data: {
            icakeAmount: icake?.toExact() || '',
            srcChain: sourceChainName,
            ifoChain: ifoChainName,
          },
        },
        type: 'bridge-icake',
      })
    } catch (e) {
      console.error(e)
      // mock
      // saveTransactionHash('0x54b077aa600b0f9f4a7c29ef3137fcbd3ccf11d429797b397987293373413680')
      // const summary = `Bridge ${icake?.toExact()} iCAKE from ${sourceChainName} to ${ifoChainName}`
      // addTransaction(
      //   { hash: '0x54b077aa600b0f9f4a7c29ef3137fcbd3ccf11d429797b397987293373413680' },
      //   {
      //     summary,
      //     translatableSummary: {
      //       text: 'Bridge %icakeAmount% iCAKE from %srcChain% to %ifoChain%',
      //       data: {
      //         icakeAmount: icake?.toExact() || '',
      //         srcChain: sourceChainName,
      //         ifoChain: ifoChainName,
      //       },
      //     },
      //     type: 'bridge-icake',
      //   },
      // )
    } finally {
      setSigning(false)
    }
  }, [
    saveTransactionHash,
    account,
    srcChainId,
    ifoChainId,
    callWithGasPrice,
    infoSender,
    addTransaction,
    icake,
    sourceChainName,
    ifoChainName,
  ])

  // Clear tx hash from local storage if message delivered
  useEffect(() => {
    if (message?.status === MessageStatus.DELIVERED) {
      clearTransactionHash()
    }
  }, [message?.status, clearTransactionHash])

  const state = useMemo<BridgeState>(() => {
    if (!txHash && !signing && !receipt && !message) {
      return INITIAL_BRIDGE_STATE
    }
    if (signing) {
      return {
        state: BRIDGE_STATE.PENDING_WALLET_SIGN,
      }
    }
    if (txHash && !receipt) {
      return {
        state: BRIDGE_STATE.PENDING_SOURCE_CHAIN_TX,
      }
    }
    if (message && message.status !== MessageStatus.DELIVERED) {
      return {
        state: BRIDGE_STATE.PENDING_CROSS_CHAIN_TX,
        ...message,
      }
    }
    if (message && message.status === MessageStatus.DELIVERED) {
      return {
        state: BRIDGE_STATE.FINISHED,
        ...message,
      }
    }
    return INITIAL_BRIDGE_STATE
  }, [signing, receipt, message, txHash])

  return {
    state,
    bridge,
  }
}

export function useBridgeMessageUrl(state: BridgeState) {
  return useMemo(
    () =>
      state.state === BRIDGE_STATE.PENDING_CROSS_CHAIN_TX || state.state === BRIDGE_STATE.FINISHED
        ? getCrossChainMessageUrl(state)
        : null,
    [state],
  )
}

export function useBridgeSuccessTxUrl(state: BridgeState) {
  return useMemo(
    () =>
      state.state === BRIDGE_STATE.FINISHED && state.dstTxHash
        ? getBlockExploreLink(state.dstTxHash, 'transaction', state.dstChainId)
        : null,
    [state],
  )
}

const getLastBridgeTxStorageKey = (chainId?: ChainId) => chainId && `bridge-icake-tx-hash-latest-${chainId}`

export function useLatestBridgeTx(chainId?: ChainId) {
  const [tx, setTx] = useState<Hash | null>(null)
  const storageKey = useMemo(() => getLastBridgeTxStorageKey(chainId), [chainId])

  const tryGetTxFromStorage = useCallback(async () => {
    if (!storageKey) {
      return
    }

    try {
      const lastTx: Hash = await localforage.getItem(storageKey)
      if (lastTx) {
        setTx(lastTx)
      }
    } catch (e) {
      console.error(e)
    }
  }, [storageKey])

  const saveTransactionHash = useCallback(
    async (txHash: Hash) => {
      setTx(txHash)
      if (storageKey) {
        await localforage.setItem(storageKey, txHash)
      }
    },
    [storageKey],
  )

  const clearTransactionHash = useCallback(async () => {
    if (storageKey) {
      await localforage.removeItem(storageKey)
    }
  }, [storageKey])

  const { data: receipt } = useQuery(
    [tx, 'bridge-icake-tx-receipt'],
    () => getViemClients({ chainId })?.waitForTransactionReceipt({ hash: tx }),
    {
      enabled: Boolean(tx && chainId),
    },
  )

  // Get last tx from storage on load
  useEffect(() => {
    tryGetTxFromStorage()
  }, [tryGetTxFromStorage])

  return {
    txHash: tx,
    receipt,
    saveTransactionHash,
    clearTransactionHash,
  }
}

type CrossChainMeesageParams = {
  txHash?: Hash | null
  srcChainId?: ChainId
}

export function useCrossChainMessage({ txHash, srcChainId }: CrossChainMeesageParams) {
  const { data: message } = useQuery(
    [txHash, srcChainId, 'ifo-cross-chain-sync-message'],
    () =>
      getCrossChainMessage({
        chainId: srcChainId,
        txHash,
      }),
    // () =>
    //   getCrossChainMessage({
    //     chainId: ChainId.BSC,
    //     txHash: '0x54b077aa600b0f9f4a7c29ef3137fcbd3ccf11d429797b397987293373413680',
    //   }),
    {
      enabled: Boolean(txHash && srcChainId),
    },
  )
  return message
}
