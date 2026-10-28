(function () {
    const root = document.documentElement;

    // THEME TOGGLE
    const themeToggle = document.getElementById('theme-toggle');
    const themeLabel = themeToggle.querySelector('.toggle-label');

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        const isDark = theme === 'dark';
        themeLabel.textContent = isDark ? 'Night' : 'Day';
        themeToggle.setAttribute('aria-pressed', String(isDark));
        themeToggle.setAttribute(
            'aria-label',
            isDark ? 'Switch to light mode' : 'Switch to dark mode'
        );
    }

    // Always start in Day mode
    applyTheme('light');
    try { localStorage.removeItem('nig-theme'); } catch (error) {}

    themeToggle.addEventListener('click', function () {
        const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        try { localStorage.setItem('nig-theme', newTheme); } catch (error) {}
    });


    // MOBILE NAVIGATION
    const burger = document.getElementById('nav-burger');
    const nav = document.getElementById('main-nav');

    burger.addEventListener('click', function () {
        const isOpen = nav.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(isOpen));
        burger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });


    // FORM ELEMENTS
    const form = document.getElementById('articleForm');

    const fields = {
        title: document.getElementById('title'),
        category: document.getElementById('category'),
        author: document.getElementById('author'),
        image: document.getElementById('image'),
        content: document.getElementById('content')
    };

    const MIN_CONTENT = 100;


    // VALIDATION RULES
    const rules = {
        title: function (value) {
            return value.trim().length < 8
                ? 'Please enter a headline of at least 8 characters.'
                : '';
        },
        category: function (value) {
            return !value ? 'Please choose a category.' : '';
        },
        author: function (value) {
            return value.trim().length < 2 ? 'Please enter your name.' : '';
        },
        image: function (value) {
            if (!value.trim()) return '';
            try {
                const url = new URL(value.trim());
                return /^https?:$/.test(url.protocol) ? '' : 'Use an http(s) link.';
            } catch (error) {
                return 'Please enter a valid URL.';
            }
        },
        content: function (value) {
            return value.trim().length < MIN_CONTENT
                ? `Article must be at least ${MIN_CONTENT} characters.`
                : '';
        }
    };


    // VALIDATE FIELDS
    function validate(name) {
        const message = rules[name](fields[name].value);
        const errorElement = document.getElementById(name + 'Error');

        errorElement.textContent = message;
        fields[name].classList.toggle('invalid', !!message);
        fields[name].setAttribute('aria-invalid', String(!!message));

        return !message;
    }

    Object.keys(fields).forEach(function (name) {
        const eventName = name === 'category' ? 'change' : 'blur';

        fields[name].addEventListener(eventName, function () {
            validate(name);
        });

        fields[name].addEventListener('input', function () {
            if (fields[name].classList.contains('invalid')) {
                validate(name);
            }
        });
    });


    // CHARACTER COUNTER
    const counter = document.getElementById('counter');

    function updateCounter() {
        const length = fields.content.value.trim().length;
        counter.textContent = length + (length === 1 ? ' character' : ' characters');
        counter.classList.toggle('ok', length >= MIN_CONTENT);
    }

    fields.content.addEventListener('input', updateCounter);


    // IMAGE PREVIEW
    const preview = document.getElementById('preview');
    const previewImg = document.getElementById('previewImg');
    const imageError = document.getElementById('imageError');

    function hidePreview() {
        preview.style.display = 'none';
        previewImg.removeAttribute('src');
    }

    fields.image.addEventListener('input', function () {
        imageError.textContent = '';
        const url = fields.image.value.trim();

        if (url && rules.image(url) === '') {
            previewImg.src = url;
            preview.style.display = 'block';
        } else {
            hidePreview();
        }
    });

    previewImg.addEventListener('error', function () {
        hidePreview();
        if (fields.image.value.trim()) {
            imageError.textContent = 'That image could not be loaded.';
        }
    });


    // SUBMIT ARTICLE
    const alertBox = document.getElementById('successAlert');
    const submitBtn = document.getElementById('submitBtn');
    let alertTimer;

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const valid = Object.keys(fields).map(validate).every(Boolean);

        if (!valid) {
            const firstInvalid = form.querySelector('.invalid');
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        const article = {
            id: Date.now(),
            title: fields.title.value.trim(),
            category: fields.category.value,
            author: fields.author.value.trim(),
            image: fields.image.value.trim(),
            content: fields.content.value.trim(),
            status: 'pending',
            submittedAt: new Date().toISOString()
        };

        // SAVE TO LOCAL STORAGE
        try {
            const savedArticles = JSON.parse(
                localStorage.getItem('nig-submissions') || '[]'
            );
            savedArticles.push(article);
            localStorage.setItem('nig-submissions', JSON.stringify(savedArticles));
        } catch (error) {
            document.getElementById('contentError').textContent =
                'Unable to save your article in this browser.';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit for review';
            return;
        }

        // RESET FORM
        form.reset();
        hidePreview();
        updateCounter();

        Object.keys(fields).forEach(function (name) {
            fields[name].classList.remove('invalid');
            fields[name].setAttribute('aria-invalid', 'false');
            document.getElementById(name + 'Error').textContent = '';
        });

        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit for review';

        alertBox.classList.add('show');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        clearTimeout(alertTimer);
        alertTimer = setTimeout(function () {
            alertBox.classList.remove('show');
        }, 8000);
    });
})();