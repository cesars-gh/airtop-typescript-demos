# Airtop YC Batch Company's Employees's Profiles

This is an example [Airtop](https://www.airtop.ai/) web application built with [`Next.js`](https://nextjs.org/)
app routing and a CLI tool that demonstrates how to extract data from yCombinator and LinkedIn using the Airtop SDK.

- Given an Airtop API key, the code goes to yCombinator company pages and extract the list of batches to choose from
- Once the batch list is fetched, the user can choose a batch and the code will extract the list of companies in the batch
- For each company, the code will extract the list of employees
- The results are displayed to the user in the web application

## Code

The Airtop code used by the web application and CLI is located in `src/lib/yc-extractor.service.ts` as a class
called `YCExtractorService`. There is also a `LinkedInExtractorService` in the same path that is used to extract
LinkedIn profile URLs for the employees.

- This is implemented in the web application in the Next.js app router API routes in `src/app/api`.
- The CLI implementation is found in `src/cli/yc-compay-employees.cli.ts`.
- The prompts and values used for the demo is located in `src/consts.ts`

## Installation

See the README in the root of the repository for initial installation instructions.

## Usage

An API key is required to use this example. You can get one [here](https://portal.airtop.ai/api-keys) (sign-up required).

### Web Application

In this directory, to start the web application server, run:

```bash
pnpm start
```

In most cases, you should be able to access the web application at [http://localhost:3000](http://localhost:3000).

### CLI Tool

To run the CLI version of this example, run:

```bash
pnpm run cli
```
