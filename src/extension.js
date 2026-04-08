const vscode = require('vscode');
const ollama = require('ollama');
const { getHtmlForChatWebview } = require('./main-chat-frame');

/**
 * @param {import('vscode').ExtensionContext} context
 */
async function activate(context) {
    try {
        await ollama.default.list();
    } catch (e) {
        vscode.window.showErrorMessage("Ollama is not running!");
    }

    const disposable = vscode.commands.registerCommand('llm-local-chat.openLLMWindow', function () {
        const panel = vscode.window.createWebviewPanel(
            'llmChat',
            'LLM Local Chat',
            vscode.ViewColumn.One,
            { 
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        panel.webview.html = getHtmlForChatWebview();

        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.type === 'sendMessage') {
                const userPrompt = message.message;
                const chunks = [];
                let lastUpdateTime = Date.now();
                const updateInterval = 100; // ms
                
                panel.webview.postMessage({
                    type: 'addMessage',
                    message: {
                        role: 'user',
                        content: userPrompt
                    }
                });

                panel.webview.postMessage({
                    type: 'addMessage',
                    message: { 
                        role: 'assistant', 
                        content: 'LLM analizuje' 
                    }
                });
                const stopThinking = startThinkingAnimation(panel);

                try {
                    const streamRes = await ollama.default.chat({
                        model: 'gemma4',
                        messages: [{ role: 'user', content: userPrompt }],
                        stream: true,
                        keep_alive: 0
                    });

                    stopThinking();

                    for await (const part of streamRes) {
                        chunks.push(part.message.content);

                        const now = Date.now();
                        if (now - lastUpdateTime > updateInterval) {
                            panel.webview.postMessage({ 
                                type: 'updateLastMessage', 
                                content: chunks.join('') 
                            });
                            lastUpdateTime = now;
                        }
                    }

                    panel.webview.postMessage({ 
                        type: 'updateLastMessage', 
                        content: chunks.join('') 
                    });
                } catch (err) {
                    stopThinking();
                    panel.webview.postMessage({ 
                        type: 'response', 
                        content: `Error: ${String(err)}` 
                    });
                }
            }
        });

        context.subscriptions.push(panel);
    });

    context.subscriptions.push(disposable);
}

/**
 * @param {import('vscode').WebviewPanel} panel
 */
function startThinkingAnimation(panel) {
    let dots = 0;
    const interval = setInterval(() => {
        dots = (dots+1) % 4;
        panel.webview.postMessage({
            type: 'updateLastMessage',
            content: '.'.repeat(dots)
        });
    }, 400);

    return () => clearInterval(interval);
}

module.exports = {
    activate,
};
