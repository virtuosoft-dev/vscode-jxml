// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "jxml-support" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('jxml-support.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from JXML Support!');
	});

	context.subscriptions.push(disposable);

	// Register a folding range provider for jxml
	context.subscriptions.push(
        vscode.languages.registerFoldingRangeProvider('jxml', {
            provideFoldingRanges(document, context, token) { // No longer async
                const allRanges: vscode.FoldingRange[] = [];
                const text = document.getText();

                // --- 1. HTML Tag Folding Logic (No Virtual Docs) ---
                const htmlTagStack: { name: string; line: number }[] = [];
                // Regex to find start and end tags, ignoring those in comments
                const tagRegex = /<\s*(\/)?\s*([a-zA-Z0-9\-]+)/g;
                let tagMatch;
                while ((tagMatch = tagRegex.exec(text)) !== null) {
                    const isClosingTag = tagMatch[1] !== undefined;
                    const tagName = tagMatch[2].toLowerCase();
                    const tagPosition = document.positionAt(tagMatch.index);

                    const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

                    if (isClosingTag) {
                        for (let i = htmlTagStack.length - 1; i >= 0; i--) {
                            if (htmlTagStack[i].name === tagName) {
                                const openTag = htmlTagStack[i];
                                if (tagPosition.line > openTag.line) {
                                    allRanges.push(new vscode.FoldingRange(openTag.line, tagPosition.line));
                                }
                                htmlTagStack.splice(i);
                                break;
                            }
                        }
                    } else if (!voidElements.has(tagName)) {
                        htmlTagStack.push({ name: tagName, line: tagPosition.line });
                    }
                }

                // --- 2. Custom JXML and JavaScript folding logic ---
                const startRegex = /<\?(jxml)?/g;
                const endRegex = /\?>/g;
                let startMatch;

                while ((startMatch = startRegex.exec(text)) !== null) {
                    endRegex.lastIndex = startMatch.index + startMatch[0].length;
                    const endMatch = endRegex.exec(text);
                    if (endMatch) {
                        const startPos = document.positionAt(startMatch.index);
                        const endPos = document.positionAt(endMatch.index + endMatch[0].length);

                        // 2a. Fold the entire <? ... ?> block
                        if (startPos.line < endPos.line) {
                            allRanges.push(new vscode.FoldingRange(startPos.line, endPos.line, vscode.FoldingRangeKind.Region));
                        }

                        // 2b. Find and fold {...} blocks within the JXML block
                        const blockContentStartIndex = startMatch.index + startMatch[0].length;
                        const blockContentEndIndex = endMatch.index;
                        const openBraceStack: number[] = [];

                        let inString: string | null = null;
                        let inSingleLineComment = false;
                        let inMultiLineComment = false;

                        for (let i = blockContentStartIndex; i < blockContentEndIndex; i++) {
                            const char = text[i];
                            const prevChar = i > blockContentStartIndex ? text[i - 1] : null;

                            if (inSingleLineComment && char === '\n') {
                                inSingleLineComment = false;
                            } else if (inMultiLineComment && char === '/' && prevChar === '*') {
                                inMultiLineComment = false;
                            } else if (inString && char === inString && prevChar !== '\\') {
                                inString = null;
                            } else if (inString && char === '\n' && inString !== '`') {
                                inString = null;
                            } else if (!inString && !inSingleLineComment && !inMultiLineComment) {
                                if ((char === '"' || char === "'" || char === '`')) {
                                    inString = char;
                                } else if (char === '/' && text[i + 1] === '/') {
                                    inSingleLineComment = true;
                                } else if (char === '/' && text[i + 1] === '*') {
                                    inMultiLineComment = true;
                                } else if (char === '{') {
                                    openBraceStack.push(i);
                                } else if (char === '}' && openBraceStack.length > 0) {
                                    const openBraceIndex = openBraceStack.pop();
                                    if (openBraceIndex) {
                                        const jsStartPos = document.positionAt(openBraceIndex);
                                        const jsEndPos = document.positionAt(i);
                                        if (jsStartPos.line < jsEndPos.line) {
                                            allRanges.push(new vscode.FoldingRange(jsStartPos.line, jsEndPos.line));
                                        }
                                    }
                                }
                            }
                        }
                        startRegex.lastIndex = endMatch.index + endMatch[0].length;
                    }
                }

                return allRanges;
            }
        })
    );
}

// This method is called when your extension is deactivated
export function deactivate() {}
