[Opact](https://www.opact.io)
==========

## What is Opact Protocol
OPACT is a privacy layer application on top of multiple different blockchains.

Developers in those blockchains can use OPACT to integrate privacy features in their application

## The SDK
The SDK provides abstranctions to implement the opact privacy system.

## Guidelines
* Use the present tense ("Add feature" not "Added feature") and the imperative mood ("Move class to..." not "Moves class to...") on commits and use the name issue on pull requests.
* Pull requests must be reviewed before merged.
* Done is better than perfect. Does it work as expected? Ship now, iterate later.
* All contributions must have tests. Remember to verify the [Github Actions CI status](https://github.com/opact-protocol/sdk/actions/workflows/CI.yaml).
* Every commit is checked using [Github Actions](https://github.com/opact-protocol/sdk/actions).
* If the CI status are not passing, the deploy will not work.

## Coding Style
- Typescript: https://github.com/airbnb/javascript

## Task Management
* GitHub Issues is used to track all tasks that needed to be done.
* Opact board is used to get a decent look on what's going on wright now.
* Every two weeks all done tasks are put together in a Milestone and the current Sprint is closed.
* Issues Board: https://github.com/orgs/hack-a-chain-software/projects/5

## Directory Structure
Here's a brief overview of the SDK structure:

```bash
├── .github
│   └── CI              # CI Workflow: validate TS and check all tests 
├── src
│   └── util            # Utils: -
│   └── ticket          # Ticket abstractions: -
│   └── merkletree      # Merkletree abstractions: -
│   └── encryptation    # Encryptation abstractions: -
│   └── key-derivation  # Key derivation abstractions: -
├── package.json
```

## Installation
Opact Protocol is powered by [**Hack-a-chain**](https://hackachain.io/).

If you have any problems configuring your enviroment, remember to read the [Nuxt Documentation](https://nuxt.com/docs).

-----------------

#### Steps
1) Clone the repository:
```bash
$ gh repo clone hack-a-chain-software/kadena-product
$ cd kadena-product
```

2) Check all packages and copy the .env.example file and edit it with your environment config:
```bash
$ cp ./front/.env.example ./front/.env
```

3) Install frontend dependencies via PNPM
```bash
$ pnpm install
```

When working on frontend, run `pnpm front dev`. Files will be compiled, concatenated and the browser will auto update.
