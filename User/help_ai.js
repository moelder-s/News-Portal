document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('ai-support');
    if (!form) return;
    const input = document.getElementById('support-q');
    const answerBox = document.getElementById('support-response');
    const modeBox = document.getElementById('support-mode');
    const button = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const question = (input.value || '').trim();
        if (!question) { input.focus(); return; }
        answerBox.textContent = 'Thinking…';
        answerBox.classList.add('is-loading');
        modeBox.textContent = '';
        button.disabled = true;
        const oldLabel = button.textContent;
        button.textContent = 'Thinking…';
        try {
            const response = await fetch('help_ai.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({
                    question,
                    csrf: document.getElementById('support-csrf')?.value || ''
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || data.error || 'The help service could not answer right now.');
            answerBox.textContent = data.answer || 'Sorry, I could not find an answer to that question.';
            modeBox.textContent = data.mode ? `Response source: ${data.mode}` : '';
        } catch (error) {
            answerBox.textContent = error.message || 'Help is temporarily unavailable. Please try again.';
            modeBox.textContent = 'If this continues, check that Apache and the AI API key are configured.';
        } finally {
            answerBox.classList.remove('is-loading');
            button.disabled = false;
            button.textContent = oldLabel;
        }
    });
});
