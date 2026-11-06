/* Replace the old submit.js. Original Saaku Submit HTML/CSS stays unchanged. */
(() => {
  'use strict';
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('articleForm');
    if (!form) return;
    document.getElementById('nav-burger')?.addEventListener('click', function () {
      const nav = document.getElementById('main-nav');
      nav?.classList.toggle('open');
      this.setAttribute('aria-expanded', String(nav?.classList.contains('open')));
    });

    const content = document.getElementById('content');
    const counter = document.getElementById('counter');
    const image = document.getElementById('image');
    const preview = document.getElementById('preview');
    const previewImg = document.getElementById('previewImg');
    const updateCount = () => { if (counter) counter.textContent = `${content?.value.length || 0} characters`; };
    content?.addEventListener('input', updateCount); updateCount();
    image?.addEventListener('input', () => {
      const url = image.value.trim();
      if (previewImg) previewImg.src = /^https?:\/\//i.test(url) ? url : '';
      if (preview) preview.style.display = url && /^https?:\/\//i.test(url) ? 'block' : 'none';
    });
    previewImg?.addEventListener('error', () => { if (preview) preview.style.display = 'none'; });

    const error = (id, text) => {
      const el = document.getElementById(id + 'Error');
      if (el) el.textContent = text || '';
    };
    const btn = document.getElementById('submitBtn');
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const title = document.getElementById('title')?.value.trim() || '';
      const category = document.getElementById('category')?.value || '';
      const contentText = content?.value.trim() || '';
      const imageUrl = image?.value.trim() || '';
      const author = document.getElementById('author')?.value.trim() || '';
      ['title','category','content','image','author'].forEach(id => error(id, ''));
      if (title.length < 8 || title.length > 120) { error('title','Title must be 8–120 characters.'); return; }
      if (!['Academic','Events','Sports','General'].includes(category)) { error('category','Select a valid category.'); return; }
      if (!author) { error('author','Please enter your name.'); return; }
      if (contentText.length < 100 || contentText.length > 30000) { error('content','Article must be 100–30,000 characters.'); return; }
      if (imageUrl && !/^https?:\/\//i.test(imageUrl)) { error('image','Use an HTTP or HTTPS image URL.'); return; }
      if (btn) { btn.disabled = true; btn.textContent = 'Publishing…'; }
      try {
        const response = await fetch('submit_action.php', {
          method: 'POST', credentials: 'same-origin',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({title, category, content: contentText, image: imageUrl})
        });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || 'Publishing failed');
        window.location.replace('browse.php');
      } catch (e) {
        alert(e.message || 'Could not publish your article.');
        if (btn) { btn.disabled = false; btn.textContent = 'Publish article'; }
      }
    });
    // Change only displayed text; no layout or stylesheet modifications.
    document.querySelector('.form-wrap .lead')?.replaceChildren(document.createTextNode('Publish your campus article directly to Browse. No admin approval is needed.'));
    document.querySelector('.form-wrap .note')?.replaceChildren(document.createTextNode('Your article will be available in Browse immediately after successful submission.'));
    if (btn) btn.textContent = 'Publish article';
    const success = document.getElementById('successAlert');
    if (success) success.textContent = '✓ Article published successfully.';
  });
})();