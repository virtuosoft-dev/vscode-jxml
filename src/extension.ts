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
			provideFoldingRanges(document, context, token) {
				console.log('Folding provider called for', document.fileName);
				const foldingRanges: vscode.FoldingRange[] = [];
				const startRegex = /<\?(jxml)?/;
				const endRegex = /\?>/;
				let startLine: number | null = null;
				let inScript = false;
				// Track JS block folding inside <? ... ?>
				let jsBlockStack: number[] = [];
				for (let i = 0; i < document.lineCount; i++) {
					const line = document.lineAt(i).text;
					if (!inScript && startRegex.test(line)) {
						startLine = i;
						inScript = true;
						continue;
					}
					if (inScript && endRegex.test(line)) {
						if (startLine !== null) {
							foldingRanges.push(new vscode.FoldingRange(startLine, i));
							console.log(`Folding range: ${startLine} to ${i}`);
						}
						startLine = null;
						inScript = false;
						jsBlockStack = [];
						continue;
					}
					if (inScript) {
						// Custom JS block folding for { ... }
						if (line.includes('{')) {
							jsBlockStack.push(i);
						}
						if (line.includes('}')) {
							const blockStart = jsBlockStack.pop();
							if (blockStart !== undefined && blockStart < i) {
								foldingRanges.push(new vscode.FoldingRange(blockStart, i));
								console.log(`JS block folding: ${blockStart} to ${i}`);
							}
						}
					}
				}
				return foldingRanges;
			}
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
