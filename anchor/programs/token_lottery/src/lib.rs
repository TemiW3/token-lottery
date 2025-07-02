#![allow(clippy::result_large_err)]
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

declare_id!("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H");

#[program]
pub mod token_lottery {
    use super::*;

    pub fn initialize_config(ctx: Context<Initialize>) -> Result<()> {
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
    pub winner_claimed: bool,
    pub start_time: u64,
    pub end_time: u64,
    pub lottery_pot: u64,
    pub ticket_price: u64,
    pub ticket_count: u64,
    pub authority: Pubkey,
    pub randomness_account: Pubkey,
}
