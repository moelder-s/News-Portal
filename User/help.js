function toggleTheme() {
    const body = document.body;
    const label = document.getElementById("toggle-label");
    if (body.classList.contains("light-mode")) {
        body.classList.remove("light-mode"); body.classList.add("dark-mode");
        if (label) label.textContent = "Night";
    } else {
        body.classList.remove("dark-mode"); body.classList.add("light-mode");
        if (label) label.textContent = "Day";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const cards = Array.from(document.querySelectorAll('.topic-card'));
    cards.forEach((card, index) => {
        const question = card.querySelector('h3');
        const answer = card.querySelector('p');
        if (!question || !answer) return;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-expanded', 'false');
        card.setAttribute('aria-label', question.textContent.trim());
        answer.id = answer.id || `help-answer-${index + 1}`;
        card.setAttribute('aria-controls', answer.id);
        const toggle = () => {
            const willOpen = !card.classList.contains('is-open');
            card.classList.toggle('is-open', willOpen);
            card.setAttribute('aria-expanded', String(willOpen));
        };
        card.addEventListener('click', toggle);
        card.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault(); toggle();
            }
        });
    });

    const search = document.getElementById('help-search');
    const status = document.getElementById('help-search-status');
    if (search) {
        search.addEventListener('input', () => {
            const query = search.value.trim().toLocaleLowerCase();
            let visible = 0;
            document.querySelectorAll('.help-topics').forEach(section => {
                const sectionCards = Array.from(section.querySelectorAll('.topic-card'));
                let sectionVisible = 0;
                sectionCards.forEach(card => {
                    const match = !query || card.textContent.toLocaleLowerCase().includes(query);
                    card.hidden = !match;
                    if (match) { visible++; sectionVisible++; }
                });
                section.hidden = sectionVisible === 0;
            });
            if (status) status.textContent = query ? `${visible} matching question${visible === 1 ? '' : 's'} found.` : '';
        });
    }
});
