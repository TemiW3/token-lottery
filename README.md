# Token Lottery (Solana + Anchor + Next.js)

A full-stack Token Lottery dApp:

- Next.js 15 + React 19 front-end with Tailwind and Wallet UI components
- Anchor-based Solana program that mints NFT tickets, collects a prize pot, and picks a winner using Switchboard On-Demand randomness
- TypeScript client generated from the IDL via Codama for type-safe instruction building

---

## Contents

- Overview
- Architecture
- Prerequisites
- Quick start (Localnet)
- Deploy to Devnet
- Web app usage
- On-chain program APIs
- Scripts
- Repository structure
- Customization
- Troubleshooting
- Acknowledgements

---

## Overview

This app implements a simple on-chain lottery:

1) Initialize a lottery configuration with a start slot, end slot, and ticket price.
2) Initialize a collection mint and metadata that all ticket NFTs will reference.
3) Users buy tickets (minted as NFTs) during the open window by paying the ticket price (lamports) to the lottery PDA account. Funds accumulate in the lottery pot.
4) The authority commits randomness and later reveals it via Switchboard On-Demand, selecting a winner modulo the number of tickets sold.
5) The winner claims the prize, transferring the accumulated pot to their wallet upon on-chain verification of the winning ticket.

NFT metadata defaults come from `metadata.json` in this repo and are referenced by the program constant `URI`.

---

## Architecture

- Program (Anchor, Rust): `anchor/programs/token_lottery/src/lib.rs`
  - Account: `Tokenlottery` (PDA: seed `"token_lottery"`)
  - Collection mint: PDA (seed `"collection_mint"`)
  - Tickets: minted per-ticket using seed of the current `ticket_count`
  - Randomness: Switchboard On-Demand Randomness Account

- Generated client (TypeScript): `anchor/src/client/js/generated`
  - Created via Codama from the IDL; re-exported in `anchor/src/tokenlottery-exports.ts`

- Web app (Next.js): `src/app`, `src/components`
  - Wallet UI and network selection via `@wallet-ui/react`
  - Program UI at route `/tokenlottery`

---

## Prerequisites

- Node.js 20+
- pnpm 9+
- Rust and Cargo
- Solana CLI (1.18.x recommended to match program deps)
- Anchor CLI 0.30+

Install or update Solana and Anchor before proceeding.

---

## Quick start (Localnet)

1) Install dependencies

```bash
pnpm install
```

2) Generate a new program id, sync it everywhere, and generate the TS client (Codama)

```bash
pnpm setup
```

This will:
- Create/rotate the keypair in `anchor/target/deploy`
- Update `declare_id!` in `anchor/programs/token_lottery/src/lib.rs`
- Update `anchor/Anchor.toml` entry
- Regenerate the TS client under `anchor/src/client/js/generated`

3) Build the program

```bash
pnpm anchor-build
```

4) Start a local validator and deploy the program

```bash
pnpm anchor-localnet
```

This runs a local validator and deploys your program to it.

5) In a new terminal, start the web app

```bash
pnpm dev
```

Then open the app and navigate to `/tokenlottery`. Connect a wallet configured for Localnet.

6) Run program tests (optional)

```bash
pnpm anchor-test
```

Note: Tests exercise the full lottery flow including Switchboard randomness. See the test at `anchor/tests/tokenlottery.test.ts`.

---

## Deploy to Devnet

1) Set your Solana CLI to devnet and fund your keypair

```bash
solana config set --url devnet
solana airdrop 2
```

2) Deploy

```bash
pnpm anchor deploy --provider.cluster devnet
```

3) Point the web app to your devnet program id

The helper in `anchor/src/tokenlottery-exports.ts` determines which program id the UI uses:

```ts
export function getTokenlotteryProgramId(cluster: SolanaClusterId) {
  switch (cluster) {
    case 'solana:devnet':
    case 'solana:testnet':
      // Replace this with YOUR deployed devnet program id
      return address('<YOUR_DEVNET_PROGRAM_ID>')
    case 'solana:mainnet':
    default:
      return TOKENLOTTERY_PROGRAM_ADDRESS
  }
}
```

Update the devnet case to your deployed id so the UI sends transactions to the correct program.

---

## Web app usage

- Connect a wallet (Localnet or Devnet) using the top-right wallet dropdown.
- Switch clusters using the network dropdown.
- Program explorer links use the selected cluster for quick verification.

Note: The UI contains example interactions and is designed to work with the generated client. The complete lottery flow is validated in tests; you can extend the UI to surface every instruction if desired.

---

## On-chain program APIs

Program id: defined by `declare_id!` in `anchor/programs/token_lottery/src/lib.rs` and synced to `Anchor.toml`.

Constants:
- `NAME`: Base name used for tickets (e.g., `"Token Lottery Ticket #"`)
- `SYMBOL`: Token symbol (e.g., `"TOK"`)
- `URI`: Metadata JSON URL (defaults to this repo's `metadata.json`)

Primary instructions:

- initialize_config(start_slot: u64, end_slot: u64, price_lamports: u64)
  - Creates and initializes the `Tokenlottery` PDA with timing and pricing

- initialize_lottery()
  - Creates the collection mint + metadata + master edition used for tickets

- buy_ticket()
  - Requires the lottery to be open (`start_time <= slot <= end_time`)
  - Transfers `ticket_price` lamports to the `Tokenlottery` PDA
  - Mints a ticket NFT (1 token) to the payer and records it under the verified collection

- commit_randomness(randomness_account: Pubkey)
  - Authority-only; stores the randomness account to be revealed later

- reveal_winner(randomness_account: Pubkey)
  - Authority-only; after `end_time`, reveals randomness and sets `winner = random % ticket_count`

- claim_prize()
  - Verifies the caller owns the winning ticket NFT (via Metaplex metadata + verified collection)
  - Transfers the entire `lottery_pot` lamports from the PDA to the winner

Account layout `Tokenlottery`:
- `bump: u8`
- `winner: u64`
- `winner_chosen: bool`
- `start_time: u64` (slot)
- `end_time: u64` (slot)
- `lottery_pot: u64` (lamports)
- `ticket_price: u64` (lamports)
- `ticket_count: u64`
- `authority: Pubkey`
- `randomness_account: Pubkey`

Switchboard On-Demand
- The test uses a Switchboard On-Demand queue and `Randomness` account to commit and reveal randomness.
- For Devnet/Mainnet, point to a valid queue on that cluster and ensure your wallet has sufficient funds.

See `anchor/tests/tokenlottery.test.ts` for a full end-to-end reference flow.

---

## Scripts

From the repo root (`package.json`):

- `pnpm setup` • Sync program id and regenerate TS client
- `pnpm anchor-build` • Build the Anchor program
- `pnpm anchor-localnet` • Run a local validator and deploy
- `pnpm anchor-test` • Run tests (Jest) against a local validator
- `pnpm dev` • Start the Next.js app (Turbopack)
- `pnpm build` • Build the Next.js app
- `pnpm codama:js` • Regenerate the TS client from the IDL

---

## Repository structure

```
anchor/
  Anchor.toml
  programs/token_lottery/
    src/lib.rs            # On-chain program
    Cargo.toml
  src/client/js/generated # TS client (auto-generated)
  src/tokenlottery-exports.ts # Re-exports & helpers
  tests/tokenlottery.test.ts  # E2E Jest test

src/
  app/
    tokenlottery/page.tsx # Program page
    layout.tsx            # App layout (links & providers)
  components/
    solana/               # Wallet UI + RPC helpers
    tokenlottery/         # UI + data-access

metadata.json             # Default NFT metadata referenced by the program
```

---

## Customization

- Update NFT metadata
  - Host your own metadata JSON with your desired `name`, `symbol`, `description`, `image`.
  - Set the on-chain `URI` constant in `lib.rs` to your hosted URL.

- Program id / cluster routing
  - After deploying to Devnet, update `getTokenlotteryProgramId` in `anchor/src/tokenlottery-exports.ts` to return your devnet program id.

- UI
  - Extend `src/components/tokenlottery/*` to expose the complete lottery flow (config, initialize, buy, commit, reveal, claim).

---

## Troubleshooting

- Program id mismatch
  - Re-run `pnpm setup` after rotating keys or redeploying.
  - Ensure the UI’s `getTokenlotteryProgramId` returns your deployed id on the selected cluster.

- Switchboard errors
  - Use a queue appropriate to your cluster; ensure the queue and randomness account are valid and funded.

- Local validator issues
  - If `anchor localnet` hangs, stop all validators and try again. Clear `.anchor` and `~/.config/solana` caches if needed.

- Toolchain mismatch
  - Align Solana toolchain (~1.18.x) and Anchor CLI (~0.30.x) with `Cargo.toml` and JS dependencies.

---

## Acknowledgements

- Anchor (Coral)
- Switchboard On-Demand
- Wallet UI and Gill toolkits
- Codama for IDL-driven client generation
