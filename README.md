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

You should now be able to try out the examples in this repository which are located in `examples/`.

See the `README.md` in each example project for more information on how to run the example.

## Tools used

Most examples use the following:

- [Airtop SDK](https://docs.airtop.ai/api-reference/airtop-api)
- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [zustand](https://github.com/pmndrs/zustand) for client-side state management in React
- [zod](https://zod.dev/) for input validation
- [React Hook Form](https://react-hook-form.com/) for forms
- [Loglayer](https://github.com/theogravity/loglayer) for logging (backed using `console.log`)
- [Inquirer.js](https://www.npmjs.com/package/inquirer) for CLI prompts
- [Biome](https://biomejs.dev/) for linting and formatting
