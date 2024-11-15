The components in this directory are generated via shadcn:

https://ui.shadcn.com/docs/components/card

If you want to add a new shadcn component, in the `packages/ui` directory, run:

`pnpm dlx shadcn@latest add <component>`

As instructed from the shadcn component page.

Post-installation, you may need to adjust the imports:

- Any `tsx` component imports need to have a `.jsx` extension
- Any `.ts` file imports need to have a `.js` extension

Then after importing the component(s), export it in the `ui/index.ts` file.
