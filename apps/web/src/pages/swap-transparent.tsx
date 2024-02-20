import { CHAIN_IDS } from 'utils/wagmi'
import Swap from '../views/Swap'
import { SwapFeaturesProvider } from '../views/Swap/SwapFeaturesContext'

const SwapPage = () => {
  return (
    <SwapFeaturesProvider>
      <Swap transparent />
    </SwapFeaturesProvider>
  )
}

SwapPage.chains = CHAIN_IDS

export default SwapPage