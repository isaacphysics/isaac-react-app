# isaac-react-app

**WARNING**: We use `yarn` now. It's now

- `yarn` instead of `npm install`
- `yarn add <package>` instead of `npm install <package>`
- `yarn --frozen-lockfile` instead of `npm ci` (sometimes it may be necessary to nuke `node_modules` too)
- Running scripts works in the same way

[![Node.js CI](https://github.com/isaacphysics/isaac-react-app/actions/workflows/node.js.yml/badge.svg)](https://github.com/isaacphysics/isaac-react-app/actions/workflows/node.js.yml)
[![codecov](https://codecov.io/gh/isaacphysics/isaac-react-app/branch/master/graph/badge.svg)](https://codecov.io/gh/isaacphysics/isaac-react-app)

`isaac-react-app` is the front end interface for the [Isaac Science](https://isaacscience.org/about) and [Ada Computer Science](https://adacomputerscience.org/about) projects. Together with [`isaac-api`](https://github.com/isaacphysics/isaac-api), it forms the core stack of the Isaac platform.

The web interface is a [React app](https://github.com/facebook/create-react-app), served by [nginx](https://nginx.org/en/) in [Docker](https://www.docker.com/).
The front-end application was initially generated from [create-react-app](https://github.com/facebook/create-react-app).

## eslint policies
Commits that introduce lint violations break the build. If this happens, it is the responsibility of the original author
to fix any violations. If you think an exception to a rule should be made for some reason, you should add 
an `// eslint-disable` directive to the line above the violating piece of code. This turns off the rule for the
specific occurrence of the issue.

The repo also contains an `eslint-suppressions` file. This is for lint violations that have been introduced with the
addition of new eslint rules (or had been introduced before we started using eslint). This file should only ever
decrease in size, when a legacy violation is fixed. That is, newly introduced lint violations should never be added to the 
suppressions file. The only exception to this rule is when a commit introduces a new eslint rule, and you deem that
fixing existing the violations would be too expensive. In this case, running `yarn run lint --fix --suppress-all` will
attempt to autofix violations, and if any violations cannot be fixed, they are added to the suppressions file.

When you fix a legacy violation, it is nice to remove these from the suppressions file by running `yarn run lint:prune`.
We should periodically do this. However, the build is configured not to break when there are outdated suppressions in
the file, so this is not, strictly speaking, necessary after each fixed violation.