# Ensea Terminus

Open-source community tools for [DeFi Kingdoms](https://x.com/DeFiKingdoms). Browse and trade items on the Bazaar, view your heroes with full stats and genetics, and track the Hall of Heroes leaderboard, all from your browser.

No backend, no database. Pure client-side React app talking directly to DFK Chain.

## Requirements

- **Node.js** 20+ (developed on 24)
- **npm** 10+
- A browser wallet (MetaMask, Rabby, etc.) connected to DFK Chain

## Quick Start

```bash
# Clone and install
git clone https://github.com/Keepcase/dfk-ensea-terminus.git
cd dfk-ensea-terminus
npm install

# Start dev server
npm run dev
# Open http://localhost:5173
```

### Docker

```bash
docker compose up
docker exec dfk-ensea-terminus-ensea-terminus-1 npm run dev
# Open http://localhost:5173
```

## Configuration

Copy `.env.example` to `.env` and fill in optional values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_NETWORK` | No | `mainnet` (default) or `testnet` |
| `VITE_DFK_RPC_URL` | No | Override default DFK Chain RPC endpoint |
| `VITE_DONATION_ADDRESS` | No | Override default donation address |

### Testnet

To develop against DFK Chain testnet (chain ID 335):

```bash
VITE_NETWORK=testnet npm run dev
```

Get test JEWEL from the [faucet](https://faucet.avax.network/?subnet=dfk).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build (single bundle) |
| `npm run preview` | Preview production build |
| `npm test` | Run tests |
| `npm run lint` | Lint with ESLint |

## Tech Stack

- **React 19** + **TypeScript** (strict mode)
- **Vite** — build tooling
- **viem** + **wagmi v2** — blockchain interactions
- **shadcn/ui** + **Tailwind CSS** — UI components and styling
- **Framer Motion** — animations
- **Vitest** — testing

## Architecture

```
src/
├── pages/          # Route pages (Catalog, Orderbook, MyOrders, HallOfHeroes)
├── components/     # UI components + shadcn primitives
├── hooks/          # Custom React hooks (one per file)
├── config/         # Chain definitions, contract ABIs, token registry
├── lib/            # Pricing math (BigInt only — never floating point)
├── types/          # TypeScript interfaces
└── test/           # Test files
```

All blockchain reads use viem multicall. All writes simulate before sending.

## DFK Chain

| | Mainnet | Testnet |
|-|---------|---------|
| **Chain ID** | 53935 | 335 |
| **RPC** | https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc | https://subnets.avax.network/defi-kingdoms/dfk-chain-testnet/rpc |
| **Native Token** | JEWEL | JEWEL |
| **Bazaar Contract** | `0x902F2b740bC158e16170d57528405d7f2a793Ca2` | `0x767A9114B61fb14732Cfca1ccA2d9FD309c74E93` |
| **Faucet** | — | [Get test JEWEL](https://faucet.avax.network/?subnet=dfk) |

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and guidelines.

## License

[MIT](LICENSE) — Erin Atkinson
