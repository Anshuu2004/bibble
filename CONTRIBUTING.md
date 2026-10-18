# 💛 Contributing to Bibble

Thanks for wanting to help make Bibble a cozier place to learn! Contributions of all sizes are welcome.

## 🌱 Ways to contribute

- **Share an idea:** Open an issue with the problem your idea would solve.
- **Report a bug:** Explain what you expected, what happened, and how to reproduce it.
- **Improve the code or docs:** Fork the repo, make a focused change, and open a pull request.

## 🧑‍💻 Get set up

1. Fork the repository and clone your fork.
2. Install dependencies with `npm install`.
3. Create a branch from `main` using the naming rules below.
4. Run the app with `npm run dev` and check your changes as you work.

## 🏷️ Branch names

Use lowercase names with hyphens. Start each branch with a type that describes the work:

| Prefix | Use for | Example |
| --- | --- | --- |
| `feature/` | A new feature or improvement | `feature/map-search` |
| `fix/` | A bug fix | `fix/room-card-layout` |
| `docs/` | Documentation changes | `docs/contribution-guidelines` |
| `refactor/` | Code changes that do not add a feature or fix a bug | `refactor/theme-hook` |
| `test/` | Adding or updating tests | `test/map-creation` |
| `chore/` | Maintenance and tooling | `chore/update-dependencies` |

Keep branch names short and specific. Avoid spaces, personal names, and vague names such as `changes` or `update`.

## 📬 Pull request rules

### Before opening a pull request

- Make your branch from the latest `main` and keep it up to date.
- Keep each pull request focused on one change. Split unrelated work into separate pull requests.
- Use the existing code patterns, accessible UI practices, and cozy Bibble look and feel.
- Update relevant documentation when behavior or setup instructions change.
- Do not include secrets, credentials, generated build output, or unrelated formatting changes.
- Bibble currently uses sample data and has no backend. Do not describe sample interactions as live, shared, or server-backed.
- Check your changes locally and run `npm run lint`. If a check fails, mention the failure and relevant details in the pull request.

### Pull request title

Use this format:

```text
type(scope): short description
```

Use a lowercase type and scope, and write the description in the imperative (say what the change does). Keep it concise and do not add a period at the end.

Common types:

- `feat` — add a feature
- `fix` — fix a bug
- `docs` — update documentation
- `style` — visual or formatting changes with no behavior change
- `refactor` — restructure code without changing behavior
- `test` — add or update tests
- `chore` — maintenance work

Examples:

```text
feat(maps): add category filters
fix(rooms): keep cards aligned on mobile
docs(readme): explain sample data
```

### Pull request description

Use this outline so reviewers can understand the change quickly:

```markdown
## What changed
- Describe the change in a few clear points.

## Why
- Explain the problem or need it addresses.

## How to check
- List the steps a reviewer can follow.

## Checklist
- [ ] I tested the change locally.
- [ ] I ran `npm run lint` and noted any failures.
- [ ] I updated relevant documentation.
- [ ] I checked the layout on a small screen, if the change affects the UI.
```

For UI changes, include a screenshot or short recording when it helps show the result. Link any related issue and call out anything that still needs work.

## 👀 Review and follow-up

- Be kind and specific when giving or receiving feedback.
- Reply to review comments and make requested changes on the same branch.
- Keep the pull request open until feedback is addressed or a follow-up plan is agreed on.
- After approval, maintainers can merge the pull request.

Thanks for helping Bibble grow, one little improvement at a time. 🍓
