import styled from 'styled-components'
import { Card } from '@pancakeswap/uikit'

export const BodyWrapper = styled(Card)<{transparent?: boolean}>`
  border-radius: 24px;
  max-width: 436px;
  border: 0px;
  width: 100%;
  z-index: 1;
  overflow: auto;
  background: ${({transparent}) => (transparent ? 'rgba(0,0,0,0.2)' : 'var(--bg-container)')};
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children, transparent }: { children: React.ReactNode, transparent?: boolean }) {
  return <BodyWrapper transparent={transparent}>{children}</BodyWrapper>
}
