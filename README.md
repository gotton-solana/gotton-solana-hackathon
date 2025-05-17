# Gotton Solana Hackathon
## Links

[Game link](https://gotton-web.bountyhunters.app/) | [Website](https://gotton.meme/) | [X profile](https://x.com/GOTTON_meme) | [Community](https://t.me/GOTTON_meme)

---

## **Overview**

Crypto Catcher GOTTON helps accelerate Solana’s proven two use cases; stablecoin and speculation.  
Log in with your wallet, purchase game tickets using USDC or BONK, and take control of real-life claw machines via your device for a chance to win crypto.

---

## **Platform Features**

### PvE

Take direct control of real-life claw machines via your device and aim to win crypto rewards.

- **Hardware**: With over five years of experience in the traditional claw machine industry, all 150+ machines are developed and operated fully in-house.
- **Broadcasting**: Each machine is equipped with two cameras (front and side view). Video feeds are streamed to the software system, which synchronises claw arm movements based on user input.
- **Software**: Handles live broadcasting, receives claw movement inputs, and verifies win/loss outcomes.
- **NFT Mechanics**: To ensure legal compliance, the game protocol uses NFTs to represent rewards (instead of direct token transfers). NFTs are pre-minted and held in an operational address. Upon a win, the NFT is automatically transferred to the connected wallet.
  - **Operational Address**: `HUQgbGNURsJNBUVAumz3rU3zx41cVtrevLpzXhyp1qW1`

### PvP and Live-streaming

Delegate your assets to streamers and let them play on your behalf. If they win, you earn rewards passively.

- **Status**: Currently undergoing battle testing in the developer environment.
- **Upcoming Update**: Prior to the PvP launch, the system will upgrade to support MPL-404 for escrow-based NFT-token swapping, enabling users to redeem NFTs for tokens at any time.

## System Requirement
```
NodeJS: version 20 or later  
NPM: version 10 or later
```

## Description

This repository is built using the [Nest](https://github.com/nestjs/nest) framework as a TypeScript starter project. It is designed for the **Gotton Solana Hackathon** competition.

## Configuration

Clone this repository:

```bash
$ git clone <repository-url>
```

Copy and make the required configuration changes in the `.env` file:

```bash
$ cp .env.example .env
```

## Installation

Install the dependencies:

```bash
$ npm install
```

## Running the app

Run the application in different modes:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

Run the tests:

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Run migration

Apply database migrations:

```bash
$ npm run typeorm migration:run
```

## Create file migrations

Generate a new migration file:

```bash
$ yarn run typeorm migration:generate src/migrations/{name_file}
```

## Support

This project is open source and licensed under MIT. Contributions and feedback are welcome. For more information about the Nest framework, visit [NestJS Documentation](https://docs.nestjs.com/support).

## Stay in touch

- Website - [https://nestjs.com](https://nestjs.com/)

## License

This project is [MIT licensed](LICENSE).
