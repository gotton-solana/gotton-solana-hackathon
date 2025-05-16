# Gotton Solana Hackathon

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
