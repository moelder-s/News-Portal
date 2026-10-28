function toggleTheme() {
    const body = document.body;
    const label = document.getElementById("toggle-label");

    if (body.classList.contains("light-mode")) {
        body.classList.remove("light-mode");
        body.classList.add("dark-mode");
        label.textContent = "Night";
    } else {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
        label.textContent = "Day";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // 1. Help Form Submission
    const helpForm = document.getElementById('helpForm');
    if (helpForm) {
        helpForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const questionInput = document.getElementById('questionInput');
            const questionText = questionInput.value.trim();
            const submitBtn = helpForm.querySelector('.btn-send');

            if (!questionText) return;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            try {
                const response = await fetch('submit-question.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ question: questionText })
                });

                const result = await response.json();

                if (response.ok && result.status === 'success') {
                    alert("Your question has been saved to the database!");
                    questionInput.value = '';
                } else {
                    alert("Error: " + (result.message || "Failed to submit."));
                }
            } catch (error) {
                console.error("Error submitting question:", error);
                alert("Network error: Check if Apache and MySQL are running in XAMPP.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send';
            }
        });
    }

    // 2. Mobile Navigation Toggle
    const button = document.getElementById('nav-burger');
    const menu = document.getElementById('main-nav');

    if (button && menu) {
        button.addEventListener('click', function () {
            const isOpen = menu.classList.toggle('open');
            button.setAttribute('aria-expanded', String(isOpen));
            button.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
        });
    }
});