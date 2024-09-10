const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

async function sendMessage(message) {
    const apiKey = config.API_KEY;
    const model = 'gpt-3.5-turbo';

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    const body = JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: message }]
    });

    let retryCount = 0;
    const maxRetries = 5;   // 최대 재시도 횟수 증가
    let delay = 2000;   // 기본 대기 시간 (밀리초) 증가

    while (retryCount < maxRetries) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: headers,
                body: body
            });

            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After');
                delay = retryAfter ? parseInt(retryAfter) * 1000 : delay * 2;   // Delay 시간을 지수적으로 증가
                console.warn(`Rate limit exceeded. Retrying after ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                retryCount++;
                continue;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.choices && data.choices.length > 0) {
                const assistantMessage = data.choices[0].message.content;
                return assistantMessage;
            } else {
                throw new Error('No message received from GPT.');
            }
        } catch (error) {
            console.error('Error during API request:', error);
            if (retryCount >= maxRetries) {
                return 'Sorry, I am having trouble responding right now. Please try again later.';
            }
        }
    }
}

function appendMessage(role, content) {
    const messageElement = document.createElement('div');
    messageElement.classList.add(role);
    messageElement.textContent = content;
    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;   // 자동 스크롤
}

sendBtn.addEventListener('click', async () => {
    const userMessage = chatInput.value.trim();
    if (userMessage) {
        appendMessage('user', userMessage);
        chatInput.value = '';
        const assistantMessage = await sendMessage(userMessage);
        appendMessage('assistant', assistantMessage);
    }
});

chatInput.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendBtn.click();
    }
});