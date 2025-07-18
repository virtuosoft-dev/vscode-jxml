# JXML Support VS Code Extension
JXML is Virtuosoft's powerful, unabridged, uninhibited, server-side implementation of inline NodeJS within XHTML. Not unlike the quick prototyping and no-compile abilities of PHP; but for NodeJS. This Visual Studio Code plugin allows code folding the the <? and ?> tags along with simplified syntax highlighting support for JavaScript within those tags (on files with the .jxml extension).

This extension provides:
- Code folding for `<? ... ?>` and `<?jxml ... ?>` tags in `.jxml` files.
- NodeJS/JavaScript syntax highlighting and code hinting within those tags.
- HTML highlighting outside those tags.

## Features
- Folding regions for server-side/script blocks in JXML.
- Embedded JavaScript support inside `<? ... ?>` and `<?jxml ... ?>`.
- HTML support for the rest of the file.

## Usage
1. Open a `.jxml` file in VS Code.
2. Use the folding arrows to collapse/expand `<? ... ?>` and `<?jxml ... ?>` blocks.
3. Enjoy JavaScript/NodeJS code completion and highlighting inside those tags.

## Development
- Run `npm run compile` to build the extension.
- Press `F5` in VS Code to launch an Extension Development Host for testing.

## License
MIT
