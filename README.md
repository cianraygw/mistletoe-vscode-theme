<p align="center"><img src="images/icon.png" width="128" alt="Mistletoe Theme icon"></p>

<h1 align="center">Mistletoe Theme</h1>

<p align="center">A cozy Christmas color theme for VS Code. Evergreen nights, holly-berry keywords, gold-star functions, and brackets that light up like a string of fairy lights.</p>

## Mistletoe Midnight

![Mistletoe Midnight](images/preview-midnight.png)

## Mistletoe Frost

![Mistletoe Frost](images/preview-frost.png)

## Features

- **Two variants**: *Midnight* (dark, deep evergreen) and *Frost* (light, warm fresh-snow paper).
- **Christmas-light brackets**: nested bracket pairs cycle through gold, red, green, ice blue, candy pink and sugar plum.
- **Readable first**: every syntax color meets WCAG AA contrast (4.5:1) against its background.
- **Full coverage**: semantic highlighting, terminal ANSI colors, git decorations, diff/merge, markdown and CSS.

## Install

1. Open the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`).
2. Search for **Mistletoe Theme** and click **Install**.
3. Run **Preferences: Color Theme** (`Ctrl+K Ctrl+T` / `Cmd+K Cmd+T`) and pick **Mistletoe Midnight** or **Mistletoe Frost**.

Bracket pair colors use VS Code's built-in `editor.bracketPairColorization.enabled`, which is on by default.

## Palette

| Ornament | Used for | Midnight | Frost |
| --- | --- | --- | --- |
| Holly berry | keywords, tags | `#f2606f` | `#b5172f` |
| Mistletoe leaf | strings | `#a3d98c` | `#2e7d3a` |
| Tree-top star | functions, attributes | `#f4c86a` | `#946200` |
| Icicle | types, classes | `#8fd3ea` | `#16708f` |
| Candy cane | numbers, constants | `#ffa3b5` | `#a8327f` |
| Sugar plum | properties | `#cdb4f5` | `#7a3fb0` |
| Eggnog / gingerbread | parameters | `#f1dcbc` | `#8b5a2b` |
| Fireside | `this`, decorators, regex | `#ff9a6b` | `#c2410c` |
| Peppermint | operators | `#7fdcc4` | `#0f7f6a` |
| Fresh snow / evergreen ink | text | `#e6eee8` | `#1e2d28` |

## Development

```bash
npm install
npm run build     # regenerate themes/*.json from scripts/palettes.mjs (fails on low contrast)
npm run preview   # re-render the screenshots (needs Google Chrome)
npm run package   # build a .vsix
```

Press `F5` in VS Code with this folder open to try the theme in an Extension Development Host.

## License

[MIT](LICENSE)
