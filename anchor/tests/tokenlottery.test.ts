import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { TokenLottery } from '../target/types/token_lottery'
import { console } from 'inspector'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

describe('tokenlottery', () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const wallet = provider.wallet as anchor.Wallet

  const program = anchor.workspace.TokenLottery as Program<TokenLottery>

  async function buyTicket() {
    const buyTicket = await program.methods
      .buyTicket()
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction()

    const computeIx = anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
      units: 400_000,
    })

    const priorityIx = anchor.web3.ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1,
    })

    const blockhashWithContext = await provider.connection.getLatestBlockhash()
    const tx = new anchor.web3.Transaction({
      feePayer: provider.wallet.publicKey,
      blockhash: blockhashWithContext.blockhash,
      lastValidBlockHeight: blockhashWithContext.lastValidBlockHeight,
    })
      .add(buyTicket)
      .add(computeIx)
      .add(priorityIx)

    const signature = await anchor.web3.sendAndConfirmTransaction(provider.connection, tx, [wallet.payer])
    console.log('Buy Ticket Signature:', signature)
  }

  it('Should test token lottery', async () => {
    const initConfigInstruction = await program.methods
      .initializeConfig(new anchor.BN(0), new anchor.BN(1822712025), new anchor.BN(10000))
      .instruction()

    const blockhashWithContext = await provider.connection.getLatestBlockhash()

    const tx = new anchor.web3.Transaction({
      feePayer: provider.wallet.publicKey,
      blockhash: blockhashWithContext.blockhash,
      lastValidBlockHeight: blockhashWithContext.lastValidBlockHeight,
    }).add(initConfigInstruction)

    console.log('Transaction:', tx)

    const signature = await anchor.web3.sendAndConfirmTransaction(provider.connection, tx, [wallet.payer], {
      skipPreflight: true,
    })
    console.log('Transaction Signature:', signature)

    const initLotteryInstruction = await program.methods
      .initializeLottery()
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction()

    const initLotteryTransaction = new anchor.web3.Transaction({
      feePayer: provider.wallet.publicKey,
      blockhash: blockhashWithContext.blockhash,
      lastValidBlockHeight: blockhashWithContext.lastValidBlockHeight,
    }).add(initLotteryInstruction)

    const initLotterySignature = await anchor.web3.sendAndConfirmTransaction(
      provider.connection,
      initLotteryTransaction,
      [wallet.payer],
      {
        skipPreflight: true,
      },
    )
    console.log('Init Lottery Signature:', initLotterySignature)

    await buyTicket()
  })
})
