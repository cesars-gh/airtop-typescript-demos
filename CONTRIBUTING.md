# Contributing

## Creating a new example

- Copy one of the existing examples in the `examples/` directory to another directory
- Update the `README.md` in the new directory to describe the example
- Edit the `src/app/layout.tsx` file and adjust the title and description for the new example
- The main entrypoint to the application is `src/app/page.tsx`
- Define API routes in the `src/app/api` directory
- Define CLI examples in the `src/cli` directory

## Before a commit

- Commit messages should follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
    * The commit message should be in the format `<type>(<scope>): <description>`. The `scope` is optional. The description must be lowercased.
- This project uses [changeset](https://github.com/changesets/changesets) for managing releases. Use the `changeset:add` 
command to add a changeset for your changes.
    * Fixes should be added to the `patch` category.
    * New features should be added to the `minor` category.
    * Breaking changes should be added to the `major` category.
