'use strict';
// Connects announcements.js to the PHP API. Load AFTER announcements.js.
const API = 'announcements_api.php';

async function loadAnnouncements() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('Load failed');
    window.updateNewsAnnouncements(await res.json());
  } catch (err) {
    console.error(err);
  }
}

// Publish button -> save to database
document.addEventListener('announcement:create', async e => {
  const { title, type, category } = e.detail;
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, type, category })
    });
    if (!res.ok) throw new Error('Save failed');
  } catch (err) {
    alert('Could not save the announcement.');
    console.error(err);
  }
  loadAnnouncements(); // refresh with real DB ids
});

// Remove button -> delete from database
document.addEventListener('announcement:delete', async e => {
  try {
    const res = await fetch(`${API}?id=${encodeURIComponent(e.detail.id)}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
  } catch (err) {
    alert('Could not delete the announcement.');
    console.error(err);
    loadAnnouncements();
  }
});

loadAnnouncements();