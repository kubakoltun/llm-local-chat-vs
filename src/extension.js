const vscode = require('vscode');
const ollama = require('ollama');
const { getHtmlForChatWebview } = require('./main-chat-frame');

function activate(context) {
    const disposable = vscode.commands.registerCommand('llm-local-chat.openChat', function () {
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
                let responseText = '';
                let lastUpdateTime = Date.now();
                const updateInterval = 100; // ms
                
                panel.webview.postMessage({
                    type: 'addMessage',
                    message: {
                        role: 'user',
                        content: userPrompt
                    }
                });
		
                try {
                    const streamRes = await ollama.default.chat({
                        model: 'qwen3:14b',
                        messages: [{ role: 'user', content: userPrompt }],
                        stream: true
                    });

                    panel.webview.postMessage({
                        type: 'addMessage',
                        message: {
                            role: 'assistant',
                            content: '...'
                        }
                    });
		
                    for await (const part of streamRes) {
                        responseText += part.message.content;

                        const now = Date.now();
                        if (now - lastUpdateTime > updateInterval) {
                            panel.webview.postMessage({ type: 'updateLastMessage', content: responseText });
                            lastUpdateTime = now;
                        }
                    }

                    panel.webview.postMessage({ type: 'updateLastMessage', content: responseText });
                } catch (err) {
                    panel.webview.postMessage({ type: 'response', content: `Error: ${String(err)}` });
                }
            }
        });

        context.subscriptions.push(panel);
    });

    context.subscriptions.push(disposable);
}

function deactivate() {
	
}

module.exports = {
    activate,
    deactivate
};
