/* Preview only; the existing PHP handler validates and saves the actual upload. */
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('avatar');
    const avatar = document.getElementById('profile-avatar');
    const status = document.getElementById('avatar-status');
    const button = document.querySelector('.profile-save');
    if (!input || !avatar || !status || !button) return;
    const original = avatar.innerHTML;
    let previewURL = null;
    const revoke = () => { if (previewURL) URL.revokeObjectURL(previewURL); previewURL = null; };
    input.addEventListener('change', () => {
        revoke(); avatar.innerHTML = original;
        input.setCustomValidity(''); status.classList.remove('is-error');
        const file = input.files[0];
        if (!file) { status.textContent = 'Your selected photo will appear in the preview.'; return; }
        const error = file.size > 2 * 1024 * 1024 ? 'Photo must be under 2 MB.' :
            !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ? 'Only JPG, PNG or WebP photos are allowed.' : '';
        if (error) {
            input.setCustomValidity(error); status.textContent = error;
            status.classList.add('is-error'); return;
        }
        const photo = document.createElement('img');
        photo.alt = 'Preview of your selected profile photo';
        previewURL = URL.createObjectURL(file); photo.src = previewURL;
        photo.addEventListener('error', () => {
            avatar.innerHTML = original; revoke();
            input.setCustomValidity('Choose a readable JPG, PNG or WebP photo.');
            status.textContent = 'This image could not be previewed. Please choose another photo.';
            status.classList.add('is-error');
        });
        avatar.replaceChildren(photo);
        status.textContent = `${file.name} · ${(file.size / 1024).toFixed(0)} KB · Ready to save`;
    });
    input.form.addEventListener('submit', () => {
        button.disabled = true; button.textContent = 'Saving…';
    });
    window.addEventListener('pagehide', event => { if (!event.persisted) revoke(); });
    window.addEventListener('pageshow', () => { button.disabled = false; button.textContent = 'Save photo'; });
});
