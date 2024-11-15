# Contributing

- Commit messages should follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
    * The commit message should be in the format `<type>(<scope>): <description>`. The `scope` is optional. The description must be lowercased.
- This project uses [changeset](https://github.com/changesets/changesets) for managing releases. Use the `changeset:add` 
command to add a changeset for your changes.
    * Fixes should be added to the `patch` category.
    * New features should be added to the `minor` category.
    * Breaking changes should be added to the `major` category.
