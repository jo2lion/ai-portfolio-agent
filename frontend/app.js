document.getElementById('chat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const inputField = document.getElementById('user-input');
    const chatWindow = document.getElementById('chat-window');
    const userMessage = inputField.value.trim();
    if (!userMessage) return;

    // 1. Render User message bubble instantly
    appendMessage(userMessage, 'user');
    inputField.value = '';

    // 2. Render temporary loading placeholder state
    const loadingId = appendMessage('Agent is thinking...', 'agent-loading');

    try {
        // 3. Extract the local database profile snapshot
        const contextResponse = await fetch('data/context.json');
        const profileContext = await contextResponse.json();

        // 4. Fire payload down to our local Docker Node backend proxy instance
        const apiResponse = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                context: profileContext
            })
        });

        const data = await apiResponse.json();
        
        // Remove loading state and show real answer
        document.getElementById(loadingId).remove();
        appendMessage(data.reply || 'Sorry, I hit an error parsing that request.', 'agent');

    } catch (error) {
        console.error('Error contacting agent workspace:', error);
        document.getElementById(loadingId).remove();
        appendMessage('Could not establish connection to the AI backend proxy.', 'agent-error');
    }
});

function appendMessage(text, sender) {
    const chatWindow = document.getElementById('chat-window');
    const bubble = document.createElement('div');
    const id = 'msg-' + Math.random().toString(36).substr(2, 9);
    bubble.id = id;

    if (sender === 'user') {
        bubble.className = 'bg-emerald-600/10 text-emerald-300 p-4 rounded-lg rounded-tr-none max-w-[85%] self-end border border-emerald-500/20 text-sm ml-auto';
    } else if (sender === 'agent-loading') {
        bubble.className = 'bg-slate-800/40 text-slate-400 p-4 rounded-lg rounded-tl-none max-w-[85%] border border-slate-800 text-sm italic animate-pulse';
    } else if (sender === 'agent-error') {
        bubble.className = 'bg-rose-950/30 text-rose-400 p-4 rounded-lg rounded-tl-none max-w-[85%] border border-rose-900/40 text-sm';
    } else {
        bubble.className = 'bg-slate-800/80 text-slate-200 p-4 rounded-lg rounded-tl-none max-w-[85%] border border-slate-700/50 text-sm whitespace-pre-wrap';
    }

    bubble.textContent = text;
    chatWindow.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return id;
}