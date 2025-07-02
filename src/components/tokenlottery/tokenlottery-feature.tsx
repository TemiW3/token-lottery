import { WalletButton } from '../solana/solana-provider'
import { TokenlotteryButtonInitialize, TokenlotteryList, TokenlotteryProgramExplorerLink, TokenlotteryProgramGuard } from './tokenlottery-ui'
import { AppHero } from '../app-hero'
import { useWalletUi } from '@wallet-ui/react'

export default function TokenlotteryFeature() {
  const { account } = useWalletUi()

  return (
    <TokenlotteryProgramGuard>
      <AppHero
        title="Tokenlottery"
        subtitle={
          account
            ? "Initialize a new tokenlottery onchain by clicking the button. Use the program's methods (increment, decrement, set, and close) to change the state of the account."
            : 'Select a wallet to run the program.'
        }
      >
        <p className="mb-6">
          <TokenlotteryProgramExplorerLink />
        </p>
        {account ? (
          <TokenlotteryButtonInitialize />
        ) : (
          <div style={{ display: 'inline-block' }}>
            <WalletButton />
          </div>
        )}
      </AppHero>
      {account ? <TokenlotteryList /> : null}
    </TokenlotteryProgramGuard>
  )
}
