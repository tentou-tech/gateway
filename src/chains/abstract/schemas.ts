import { Type, Static } from '@sinclair/typebox';

import { getAbstractChainConfig } from './abstract.config';

// Get chain config for defaults
const abstractChainConfig = getAbstractChainConfig();

// Example values
const EXAMPLE_TX_HASH = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
const EXAMPLE_BALANCE_TOKENS = ['ETH', 'USDC', 'WETH'];
const EXAMPLE_ALLOWANCE_TOKENS = ['USDC', 'WETH'];
const EXAMPLE_AMOUNT = '0.01';
const EXAMPLE_SPENDER = 'uniswap-abstract/router';

// Address parameter with proper defaults
export const AbstractAddressParameter = Type.Optional(
  Type.String({
    description: 'Abstract wallet address',
    default: abstractChainConfig.defaultWallet,
  }),
);

// Status request schema - Abstract has no network parameter (always 'abstract')
export const AbstractStatusRequest = Type.Object({});

// Balance request schema
export const AbstractBalanceRequest = Type.Object({
  address: AbstractAddressParameter,
  tokens: Type.Optional(
    Type.Array(Type.String(), {
      description:
        'A list of token symbols (ETH, USDC, WETH) or token addresses. Both formats are accepted and will be automatically detected. An empty array is treated the same as if the parameter was not provided, returning only non-zero balances (with the exception of ETH).',
      examples: [EXAMPLE_BALANCE_TOKENS],
    }),
  ),
});

// Estimate gas request schema
export const AbstractEstimateGasRequest = Type.Object({});

// Poll request schema
export const AbstractPollRequest = Type.Object({
  signature: Type.String({
    description: 'Transaction hash to poll',
    examples: [EXAMPLE_TX_HASH],
  }),
});

// Allowances request schema (multiple tokens)
export const AllowancesRequestSchema = Type.Object({
  address: AbstractAddressParameter,
  spender: Type.String({
    description: 'Connector name (e.g., uniswap-abstract/router) or contract address',
    examples: [EXAMPLE_SPENDER],
  }),
  tokens: Type.Array(Type.String(), {
    description: 'Array of token symbols or addresses',
    examples: [EXAMPLE_ALLOWANCE_TOKENS],
  }),
});

// Allowances response schema
export const AllowancesResponseSchema = Type.Object({
  spender: Type.String(),
  approvals: Type.Record(Type.String(), Type.String()),
});

// Approve request schema
export const ApproveRequestSchema = Type.Object({
  address: AbstractAddressParameter,
  spender: Type.String({
    description: 'Connector name (e.g., uniswap-abstract/router) or contract address',
    examples: [EXAMPLE_SPENDER],
  }),
  token: Type.String({
    description: 'Token symbol or address',
    examples: [EXAMPLE_ALLOWANCE_TOKENS[0]],
  }),
  amount: Type.Optional(
    Type.String({
      description: 'The amount to approve. If not provided, defaults to maximum amount (unlimited approval).',
      default: '',
    }),
  ),
});

// Approve response schema
export const ApproveResponseSchema = Type.Object({
  signature: Type.String(),
  status: Type.Number({ description: 'TransactionStatus enum value' }),

  // Only included when status = CONFIRMED
  data: Type.Optional(
    Type.Object({
      tokenAddress: Type.String(),
      spender: Type.String(),
      amount: Type.String(),
      nonce: Type.Number(),
      fee: Type.String(),
    }),
  ),
});

// Wrap request schema
export const WrapRequestSchema = Type.Object({
  address: AbstractAddressParameter,
  amount: Type.String({
    description: 'The amount of native ETH to wrap',
    examples: [EXAMPLE_AMOUNT],
  }),
});

// Wrap response schema
export const WrapResponseSchema = Type.Object({
  signature: Type.String(),
  status: Type.Number({ description: 'TransactionStatus enum value' }),

  // Only included when status = CONFIRMED
  data: Type.Optional(
    Type.Object({
      nonce: Type.Number(),
      fee: Type.String(),
      amount: Type.String(),
      wrappedAddress: Type.String(),
      nativeToken: Type.String(),
      wrappedToken: Type.String(),
    }),
  ),
});

// Unwrap request schema
export const UnwrapRequestSchema = Type.Object({
  address: AbstractAddressParameter,
  amount: Type.String({
    description: 'The amount of WETH to unwrap',
    examples: [EXAMPLE_AMOUNT],
  }),
});

// Unwrap response schema
export const UnwrapResponseSchema = Type.Object({
  signature: Type.String(),
  status: Type.Number({ description: 'TransactionStatus enum value' }),

  // Only included when status = CONFIRMED
  data: Type.Optional(
    Type.Object({
      nonce: Type.Number(),
      fee: Type.String(),
      amount: Type.String(),
      wrappedAddress: Type.String(),
      nativeToken: Type.String(),
      wrappedToken: Type.String(),
    }),
  ),
});

// Type exports
export type AllowancesRequestType = Static<typeof AllowancesRequestSchema>;
export type AllowancesResponseType = Static<typeof AllowancesResponseSchema>;
export type ApproveRequestType = Static<typeof ApproveRequestSchema>;
export type ApproveResponseType = Static<typeof ApproveResponseSchema>;
export type WrapRequestType = Static<typeof WrapRequestSchema>;
export type WrapResponseType = Static<typeof WrapResponseSchema>;
export type UnwrapRequestType = Static<typeof UnwrapRequestSchema>;
export type UnwrapResponseType = Static<typeof UnwrapResponseSchema>;
