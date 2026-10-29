/* Drop-in replacement submission handler. Does not change Saaku Copy layout/CSS. */
(() => {
  // Capture the submit before legacy JS shows a fake success/pending message.
  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (!form.matches('#submit-form, #article-form, form.article-form, form.submit-form')) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    const field = (name) => form.querySelector(`[name="${name}"], #${name}, #article-${name}`);
    const title = field('title')?.value?.trim() || '';
    const category = field('category')?.value || '';
    const content = field('content')?.value?.trim() || '';
    const image = (field('image') || field('image_url'))?.value?.trim() || '';
    const button = form.querySelector('[type="submit"]');
    if (!title || !category || !content) {
      alert('Please complete the headline, category, and article fields.');
      return;
    }
    if (button) button.disabled = true;
    try {
      const response = await fetch('submit_action.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ title, category, content, image })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Publishing failed.');
      window.location.assign(data.redirect || 'browse.php');
    } catch (error) {
      alert(error.message || 'Unable to publish. Please try again.');
    } finally {
      if (button) button.disabled = false;
    }
  }, true);
})();
