# Galachain Monorepo Template

## Requirements

- [NodeJS v18.20.3 (Hydrogen) & NPM v10.7.0](https://nodejs.org/en/about/previous-releases)
- [@gala-chain/cli@1.1.25 (global)](https://www.npmjs.com/package/@gala-chain/cli)
- [nodemon@latest (global)](https://www.npmjs.com/package/nodemon)
- [jq@latest](https://jqlang.github.io/jq/download/)
- [yq@latest](https://github.com/mikefarah/yq?tab=readme-ov-file#macos--linux-via-homebrew)

## Quickstart

1. Generate the necessary network keys (`chaincode/keys`) with `galachain init chaincode`
2. Install dependencies after you `cd chaincode` with `npm i`
3. Spin up your devnet with `npm run network:start` (NOTE: If this is your first time spinning up the devnet on your machine, it may take a while to download all of the required images.)
4. In a NEW window, `cd chaincode` and then `npm run test:e2e` to verify that your devnet works.
5. Use `CTRL+C` to deactivate and prune the current devnet.  
6. Optionally: `npm run network:up` to download the rest of the images for faster development. Just make sure to `npm run network:prune` after you're done.

## Chaincode Scripts

Description of behaviors observed with the scripts found in `chaincode/package.json`

### Network

- `network:up` Boots up the local devnet with port 8801 exposed. This is used for development of frontend or backend projects.
- `network:prune` Stops and tears down the local devnet, deleting every container related to it.
- `network:start` Boots up the local devnet without exposing port 8801. It uses `nodemon` to refresh and redeploy(? `fact check this`) chaincode contracts you're developing in real time. This is also used for e2e testing. Using `CTRL+C` will exhibit the same behavior as `network:prune`.
- `network:reacreate` It appears to tear down the network and restart it with `network:start`.

### Test

- `test` Default test command that runs literally every test.
- `test:e2e` Specifically only run the e2e tests.
- `update-snapshot` updates all `__snapshot__` folders and while testing if you are expecting the contract APIs to change between tests. (e.g. adding/removing features)
- `test:src` CUSTOM script to test the smart contracts only

## Notes on Frontend or Backend Development

To interact with the devnet, port 8801 must be accessible. This means that you absolutely MUST use `network:up` when testing your frontend or backend.
