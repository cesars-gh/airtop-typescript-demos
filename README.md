# Airtop Examples

This repository contains a collection of examples that demonstrate how to use [Airtop](https://docs.airtop.ai/guides/getting-started/what-is-airtop)
in various applications.

## Pre-requisites

- Node.js 20 or higher is required to run these examples.
- [pnpm](https://pnpm.io/) is used as the package manager. 
  * [Install pnpm](https://pnpm.io/installation)
- [turbo](https://turbo.build/) is used to build the shared packages.
  * [Install turbo](https://turbo.build/docs/installation) 

## Installation

- Clone this repository
- Install all dependencies by running:
  ```bash
  pnpm install
  ```
- Build the packages by running:
  ```bash
  turbo build:packages
  ```

You should now be able to try out the examples in this repository which are located in `apps/`.

See the `README.md` in each example directory for more information on how to run the example.
