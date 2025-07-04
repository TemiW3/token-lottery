/**
 * This code was AUTOGENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import {
  containsBytes,
  fixEncoderSize,
  getBytesEncoder,
  type Address,
  type ReadonlyUint8Array,
} from 'gill';
import {
  type ParsedCloseInstruction,
  type ParsedDecrementInstruction,
  type ParsedIncrementInstruction,
  type ParsedInitializeInstruction,
  type ParsedSetInstruction,
} from '../instructions';

export const TOKENLOTTERY_PROGRAM_ADDRESS =
  'JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H' as Address<'JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H'>;

export enum TokenlotteryAccount {
  Tokenlottery,
}

export function identifyTokenlotteryAccount(
  account: { data: ReadonlyUint8Array } | ReadonlyUint8Array
): TokenlotteryAccount {
  const data = 'data' in account ? account.data : account;
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([255, 176, 4, 245, 188, 253, 124, 25])
      ),
      0
    )
  ) {
    return TokenlotteryAccount.Tokenlottery;
  }
  throw new Error(
    'The provided account could not be identified as a tokenlottery account.'
  );
}

export enum TokenlotteryInstruction {
  Close,
  Decrement,
  Increment,
  Initialize,
  Set,
}

export function identifyTokenlotteryInstruction(
  instruction: { data: ReadonlyUint8Array } | ReadonlyUint8Array
): TokenlotteryInstruction {
  const data = 'data' in instruction ? instruction.data : instruction;
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([98, 165, 201, 177, 108, 65, 206, 96])
      ),
      0
    )
  ) {
    return TokenlotteryInstruction.Close;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([106, 227, 168, 59, 248, 27, 150, 101])
      ),
      0
    )
  ) {
    return TokenlotteryInstruction.Decrement;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([11, 18, 104, 9, 104, 174, 59, 33])
      ),
      0
    )
  ) {
    return TokenlotteryInstruction.Increment;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([175, 175, 109, 31, 13, 152, 155, 237])
      ),
      0
    )
  ) {
    return TokenlotteryInstruction.Initialize;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([198, 51, 53, 241, 116, 29, 126, 194])
      ),
      0
    )
  ) {
    return TokenlotteryInstruction.Set;
  }
  throw new Error(
    'The provided instruction could not be identified as a tokenlottery instruction.'
  );
}

export type ParsedTokenlotteryInstruction<
  TProgram extends string = 'JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H',
> =
  | ({
      instructionType: TokenlotteryInstruction.Close;
    } & ParsedCloseInstruction<TProgram>)
  | ({
      instructionType: TokenlotteryInstruction.Decrement;
    } & ParsedDecrementInstruction<TProgram>)
  | ({
      instructionType: TokenlotteryInstruction.Increment;
    } & ParsedIncrementInstruction<TProgram>)
  | ({
      instructionType: TokenlotteryInstruction.Initialize;
    } & ParsedInitializeInstruction<TProgram>)
  | ({
      instructionType: TokenlotteryInstruction.Set;
    } & ParsedSetInstruction<TProgram>);
