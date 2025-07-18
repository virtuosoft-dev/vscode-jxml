"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
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
    context.subscriptions.push(vscode.languages.registerFoldingRangeProvider('jxml', {
        async provideFoldingRanges(document, token) {
            // Create a virtual document to get HTML folding ranges
            const virtualDoc = await vscode.workspace.openTextDocument({
                language: 'html',
                content: document.getText()
            });
            const htmlRanges = await vscode.commands.executeCommand('vscode.executeFoldingRangeProvider', virtualDoc.uri) || [];
            // --- Custom JXML and JavaScript folding logic ---
            const jxmlAndJsRanges = [];
            const text = document.getText();
            const startRegex = /<\?(jxml)?/g;
            const endRegex = /\?>/g;
            let startMatch;
            while ((startMatch = startRegex.exec(text)) !== null) {
                endRegex.lastIndex = startMatch.index + startMatch[0].length;
                const endMatch = endRegex.exec(text);
                if (endMatch) {
                    const startPos = document.positionAt(startMatch.index);
                    const endPos = document.positionAt(endMatch.index + endMatch[0].length);
                    // 1. Fold the entire <? ... ?> block
                    if (startPos.line < endPos.line) {
                        jxmlAndJsRanges.push(new vscode.FoldingRange(startPos.line, endPos.line, vscode.FoldingRangeKind.Region));
                    }
                    // 2. Find and fold {...} blocks within the JXML block
                    const blockContentStartIndex = startMatch.index + startMatch[0].length;
                    const blockContentEndIndex = endMatch.index;
                    const openBraceStack = [];
                    for (let i = blockContentStartIndex; i < blockContentEndIndex; i++) {
                        if (text[i] === '{') {
                            openBraceStack.push(i);
                        }
                        else if (text[i] === '}' && openBraceStack.length > 0) {
                            const openBraceIndex = openBraceStack.pop();
                            if (openBraceIndex) {
                                const jsStartPos = document.positionAt(openBraceIndex);
                                const jsEndPos = document.positionAt(i);
                                if (jsStartPos.line < jsEndPos.line) {
                                    jxmlAndJsRanges.push(new vscode.FoldingRange(jsStartPos.line, jsEndPos.line));
                                }
                            }
                        }
                    }
                    startRegex.lastIndex = endMatch.index + endMatch[0].length;
                }
            }
            // Combine all the folding ranges
            return [...htmlRanges, ...jxmlAndJsRanges];
        }
    }));
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map