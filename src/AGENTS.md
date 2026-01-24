# Frontend rules

- Keep constants, types/interfaces, and utilities in specific files, outside of a feature or component.
- Never define magic numbers or strings, store them as variables
- Always use descriptive variable names
- Apply early return principles
- Reduce amount of nested logical checks
- Use absolute imports
- Files must have less than 150 lines of code

## React

- If you run `useMemo` and have a complex calculation there, split it to an outside function
- Components should never define sub-components or custom functions inside, they should be placed in outside files
- Styles are handled with shadcn, use the CLI `bunx shadcn@latest ...` to add new components. Only use colors defined by the theme in src/index.css
- Any number field needs to be wrapped around the `<PrivateValue>` React component or `toPrivateValue` function
- For icons use lucide-react and import the name with the `Icon` suffix: `ArrowUpIcon` instead of `ArrowUp`
- Features must always create sub-components so the main feature code is small to read.
- Features and feature components should have their own state handling if it's not used by any other components
- Use primitive dependencies for hooks (useEffect, useMemo, useCallback)
- Use separate type files for `formSchema`
- Use separate type files for constants (`const MY_SPECIFIC_VALUE = {...}`)
- When working with forms, use `zodResolver` from `zod/v3`. Number fields must be registered with `valueAsNumber: true`

## Naming conventions

- Pages: `src/pages/<name>-page.tsx`
- Generic components: `src/features/<name>/components/<name>-component.tsx`
- Features: `src/features/<name>/<name>-feature.tsx`
- Feature components: `src/features/<name>/components/<component-name>.tsx`
- Feature utilities: `src/features/<name>/lib/<utility-name>.ts`
- Providers: `src/providers/<name>-provider.tsx`
- Hooks and queries: `src/hooks/use-<name>.ts`

## TypeScript

- Never use `any` as a type
- Never use explicit type casts (`const a = "" as number`)
