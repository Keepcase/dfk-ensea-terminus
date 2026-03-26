# Contributing to Ensea Terminus

Thanks for your interest in contributing! This project is open source and community contributions are welcome.

## Getting Started

1. Fork the repo and clone your fork
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Open http://localhost:5173

### Testnet Development

For testing without real JEWEL:

```bash
VITE_NETWORK=testnet npm run dev
```

Get test JEWEL from the [faucet](https://faucet.avax.network/?subnet=dfk).

## Before Submitting a PR

Run all checks — CI will run these automatically on your PR:

```bash
npm run lint        # ESLint
npx tsc --noEmit    # TypeScript
npm test            # Vitest
npm run build       # Production build
```

## Code Guidelines

- **TypeScript strict mode** — no `any` types
- **Price math uses BigInt only** — never floating point. All logic in `src/lib/pricing.ts`
- **Contract addresses and chain IDs** only in `src/config/` — never hardcode elsewhere
- **ABIs typed `as const`** for viem type inference
- **One hook per file** in `src/hooks/`, named `use*.ts`
- **shadcn/ui** for UI components — no other UI libraries

## Architecture

- All blockchain reads use viem multicall to minimize RPC calls
- All writes call `simulateContract` before `writeContract`
- Network config (mainnet/testnet) is in `src/config/network.ts` — everything reads from there
- No backend, no database — all data comes from on-chain reads and the Glacier API

## Adding Tests

Tests use Vitest. Place test files in `src/test/` following existing patterns:

- `pricing.test.ts` — price math
- `validation.test.ts` — order validation
- `tokens.test.ts` — token registry integrity
- `contracts.test.ts` — contract config integrity

## Pull Request Process

1. Fork the repo
2. Create a feature branch from `main`
3. Make your changes
4. Ensure all checks pass (lint, types, tests, build)
5. Open a PR with a clear description of what you changed and why
6. CI will run automatically — all checks must pass

## Questions?

Open an issue or reach out on [X (@Keepcase)](https://x.com/keepcase).
