module.exports = {
    getHtmlForChatWebview
};

function getHtmlForChatWebview() {
    return /*html*/`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
			<style>
                :root {
                    --vscode-background: var(--vscode-editor-background);
                    --vscode-foreground: var(--vscode-editor-foreground);
                    --input-background: var(--vscode-input-background);
                    --input-foreground: var(--vscode-input-foreground);
                    --button-background: var(--vscode-button-background);
                    --button-foreground: var(--vscode-button-foreground);
                    --button-hover-background: var(--vscode-button-hoverBackground);
                }

                body {
                    padding: 20px;
                    color: var(--vscode-foreground);
                    font-family: var(--vscode-font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
                    font-size: 13px;
                    line-height: 1.4;
                    margin: 0;
                    background: var(--vscode-background);
                }

                #chat-container {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    max-width: 800px;
                    margin: 0 auto;
                }

                #response-section {
                    flex: 1;
                    overflow-y: auto;
                    margin-bottom: 20px;
                    padding: 10px;
                    border: 1px solid var(--vscode-input-border, rgba(255, 255, 255, 0.1));
                    border-radius: 4px;
                    background: var(--vscode-input-background);
                }

                #input-container {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-bottom: 20px;
                }

                #prompt-input {
                    width: 100%;
                    min-height: 60px;
                    padding: 8px;
                    background: var(--input-background);
                    color: var(--input-foreground);
                    border: 1px solid var(--vscode-input-border, rgba(255, 255, 255, 0.1));
                    border-radius: 4px;
                    resize: vertical;
                    font-family: inherit;
                    box-sizing: border-box;
                }

                #send-button {
                    align-self: flex-end;
                    padding: 6px 16px;
                    background: var(--button-background);
                    color: var(--button-foreground);
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    transition: background-color 0.2s;
                }

                #send-button:hover {
                    background: var(--button-hover-background);
                }

                #send-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .message {
                    margin-bottom: 16px;
                    padding: 12px;
                    border-radius: 4px;
                    word-wrap: break-word;
                }

                .message.user {
                    background: var(--vscode-input-background);
                    border-left: 3px solid var(--button-background);
                    margin-left: 20%;
                }

                .message.error {
                    background: var(--vscode-inputValidation-errorBackground);
                    border-left: 3px solid var(--vscode-errorForeground);
                }

                .message.assistant {
                    background: var(--vscode-editor-background);
                    border-left: 3px solid var(--vscode-textLink-foreground);
                    margin-right: 20%;
                }

                pre {
                    background: var(--vscode-textBlockQuote-background);
                    padding: 8px;
                    border-radius: 4px;
                    overflow-x: auto;
                }
                
                code {
                    font-family: var(--vscode-editor-font-family);
                }
            </style>
        </head>
        <body>
            <div id="chat-container">
                <div id="response-section">
                </div>
                <div id="input-container">
                    <textarea 
                        id="prompt-input" 
                        placeholder="Treść zapytania..."
                        rows="3"
                    ></textarea>
                    <button id="send-button">Wyślij</button>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();

                function createMessageElement(message) {
                    const div = document.createElement('div');
                    const msgRole = message.role;
                    div.className = 'message ' + msgRole;
                    
                    const roleLabel = document.createElement('div');
                    roleLabel.className = 'role-label';
                    roleLabel.textContent = message.role.charAt(0).toUpperCase() + message.role.slice(1);
                    div.appendChild(roleLabel);
                    
                    const content = document.createElement('div');
                    content.className = 'content';
                    content.textContent = message.content;
                    div.appendChild(content);
                    
                    return div;
                }
                
                document.getElementById('send-button').addEventListener('click', () => {
                    const input = document.getElementById('prompt-input');
                    const message = input.value.trim();
                    
                    if (message) {
                        vscode.postMessage({
                            type: 'sendMessage',
                            message: message
                        });
                        
                        input.value = '';
                    }
                });

                document.getElementById('prompt-input').addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        document.getElementById('send-button').click();
                    }
                });

                window.addEventListener('message', event => {
                    const message = event.data;
                    const responseSection = document.getElementById('response-section');

                    if (message.type === 'addMessage') {
                        const messageElement = createMessageElement(message.message);
                        responseSection.appendChild(messageElement);
                        messageElement.scrollIntoView({ behavior: 'smooth' });
                    } 
                    else if (message.type === 'updateLastMessage') {
                        const lastMessage = responseSection.lastElementChild;
                        if (lastMessage) {
                            const content = lastMessage.querySelector('.content');
                            if (content) {
                                content.textContent = message.content;
                                lastMessage.scrollIntoView({ behavior: 'smooth' });
                            }
                        }
                    }
                });
            </script>
        </body>
        </html>
    `;
}
