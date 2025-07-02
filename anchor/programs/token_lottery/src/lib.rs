#![allow(clippy::result_large_err)]
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

declare_id!("7BGduEL66H36gUVr83ReQ6E1bLhSrWxhKJZKUoQ8vqH9");

#[program]
pub mod token_lottery {
    use super::*;

    pub fn initialize_config(ctx: Context<Initialize>, start: u64, end: u64, price: u64) -> Result<()> {
        ctx.accounts.token_lottery.bump = ctx.bumps.token_lottery;
        ctx.accounts.token_lottery.start_time = start;
        ctx.accounts.token_lottery.end_time = end;
        ctx.accounts.token_lottery.ticket_price = price;
        ctx.accounts.token_lottery.authority = *ctx.accounts.payer.key;
        ctx.accounts.token_lottery.lottery_pot = 0;
        ctx.accounts.token_lottery.ticket_count = 0;
        ctx.accounts.token_lottery.randomness_account = Pubkey::default(); // Placeholder for randomness
        ctx.accounts.token_lottery.winner_chosen = false;
        Ok(())
    }

   

}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  init,
  space = 8 + Tokenlottery::INIT_SPACE,
  payer = payer,
  seeds = [b"token_lottery".as_ref()],
  bump,
    )]
    pub token_lottery: Account<'info, Tokenlottery>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Tokenlottery {
    pub bump: u8,
    pub winner: u64,
    pub winner_chosen: bool,
    pub start_time: u64,
    pub end_time: u64,
    pub lottery_pot: u64,
    pub ticket_price: u64,
    pub ticket_count: u64,
    pub authority: Pubkey,
    pub randomness_account: Pubkey,
}
