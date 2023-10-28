import { DefaultSeoProps } from 'next-seo'

export const SEO: DefaultSeoProps = {
  titleTemplate: '%s | BTAFSwap',
  defaultTitle: 'BTAFSwap',
  description:
    'Cheaper and faster than Uniswap? Discover BTAFSwap, the leading DEX on BNB Smart Chain (BSC) with the best farms in DeFi and a lottery for BTAF.',
  twitter: {
    cardType: 'summary_large_image',
    handle: '@BTAFSwap',
    site: '@BTAFSwap',
  },
  openGraph: {
    title: ' BTAFSwap - A next evolution DeFi exchange on BNB Smart Chain (BSC)',
    description:
      'The most popular AMM on BSC by user count! Earn BTAF through yield farming or win it in the Lottery, then stake it in Syrup Pools to earn more tokens! Initial Farm Offerings (new token launch model pioneered by BTAFSwap), NFTs, and more, on a platform you can trust.',
    images: [{ url: 'https://assets.pancakeswap.finance/web/og/hero.jpg' }],
  },
}
