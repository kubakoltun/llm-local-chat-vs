const vscode = require('vscode');
const ollama = require('ollama');
const { getHtmlForChatWebview } = require('./main-chat-frame');

function activate(context) {
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
                        model: 'qwen3-coder:30b',
                        messages: [{ role: 'user', content: userPrompt }],
                        stream: true
                    });

                    stopThinking();

                    for await (const part of streamRes) {
                        responseText += part.message.content;

                        const now = Date.now();
                        if (now - lastUpdateTime > updateInterval) {
                            panel.webview.postMessage({ 
                                type: 'updateLastMessage', 
                                content: responseText 
                            });
                            lastUpdateTime = now;
                        }
                    }

                    panel.webview.postMessage({ 
                        type: 'updateLastMessage', 
                        content: responseText 
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

function startThinkingAnimation(panel) {
    let dots = 0;
    const interval = setInterval(() => {
        dots = (dots+1) % 4;
        panel.webview.postMessage({
            type: 'updateLastMessage',
            content: 'LLM analizuje' + '.'.repeat(dots)
        });
    }, 400);

    return () => clearInterval(interval);
}

module.exports = {
    activate,
};
