# isaac-react-app

**WARNING**: We use `yarn` now. It's now

- `yarn` instead of `npm install`
- `yarn add <package>` instead of `npm install <package>`
- `yarn --frozen-lockfile` instead of `npm ci` (sometimes it may be necessary to nuke `node_modules` too)
- Running scripts works in the same way

![Node.js CI](https://github.com/isaaccomputerscience/isaac-react-app/workflows/Node.js%20CI/badge.svg)

`isaac-react-app` is the front end interface for the [Isaac Computer Science](https://isaaccomputerscience.org/about) projects. Together with [`isaac-api`](https://github.com/isaaccomputerscience/isaac-api), it forms the core stack of the Isaac platform.

The web interface is a [React app](https://github.com/facebook/create-react-app), served by [nginx](https://nginx.org/en/) in [Docker](https://www.docker.com/).
The front-end application was initially generated from [create-react-app](https://github.com/facebook/create-react-app).
