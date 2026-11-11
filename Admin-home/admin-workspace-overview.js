/* Admin main-content overview. Reads existing admin_api.php list results; no mock data. */
(() => {
  'use strict';
  const root = document.querySelector('[data-ng-workspace]');
  if (!root) return;
  const kind = root.dataset.ngWorkspace;
  const text = (v) => String(v ?? '').trim();
  const group = (items, prop) => {
    const counts = new Map();
    items.forEach(item => {
      const label = text(item[prop]) || 'Other';
      const clean = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
      counts.set(clean, (counts.get(clean) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  };
  const config = {
    articles: items => ({
      labels: ['Total articles', 'Academic', 'Sports'],
      values: [items.length, items.filter(x => text(x.category).toLowerCase() === 'academic').length, items.filter(x => text(x.category).toLowerCase() === 'sports').length],
      notes: ['Articles in database', 'Academic news articles', 'Sports news articles'],
      breakdown: group(items, 'category')
    }),
    categories: items => {
      const active = items.filter(x => Number(x.is_active) === 1).length;
      return { labels: ['Total categories', 'Active', 'Inactive'], values: [items.length, active, items.length - active], notes: ['Categories in database', 'Currently enabled', 'Currently disabled'], breakdown: [['Active', active], ['Inactive', items.length - active]] };
    },
    approvals: items => ({
      labels: ['Pending submissions', 'Academic', 'Sports'],
      values: [items.length, items.filter(x => text(x.category).toLowerCase() === 'academic').length, items.filter(x => text(x.category).toLowerCase() === 'sports').length],
      notes: ['Awaiting review', 'Academic submissions', 'Sports submissions'], breakdown: group(items, 'category')
    }),
    announcements: items => {
      const featured = items.filter(x => text(x.type).toLowerCase() === 'featured').length;
      const breaking = items.filter(x => text(x.type).toLowerCase() === 'breaking').length;
      return { labels: ['Total announcements', 'Featured', 'Breaking'], values: [items.length, featured, breaking], notes: ['Announcements in database', 'Featured stories', 'Breaking news notices'], breakdown: group(items, 'type') };
    }
  };
  const named = ['one', 'two', 'three'];
  function render(items) {
    const result = config[kind](items);
    named.forEach((n, i) => {
      root.querySelector(`[data-ng-label="${n}"]`).textContent = result.labels[i];
      root.querySelector(`[data-ng-value="${n}"]`).textContent = result.values[i].toLocaleString();
      root.querySelector(`[data-ng-note="${n}"]`).textContent = result.notes[i];
    });
    const target = root.querySelector('[data-ng-breakdown]');
    target.replaceChildren();
    const total = result.breakdown.reduce((sum, [, count]) => sum + count, 0);
    if (!total) { const msg = document.createElement('p'); msg.className = 'ng-workspace-empty'; msg.textContent = 'No records available yet.'; target.append(msg); return; }
    result.breakdown.slice(0, 6).forEach(([name, count]) => {
      const item = document.createElement('div'); item.className = 'ng-workspace-bar-item';
      const caption = document.createElement('div'); caption.className = 'ng-workspace-bar-caption';
      const label = document.createElement('span'); label.textContent = name;
      const value = document.createElement('strong'); value.textContent = count.toLocaleString();
      caption.append(label, value);
      const track = document.createElement('div'); track.className = 'ng-workspace-bar-track';
      const fill = document.createElement('div'); fill.className = 'ng-workspace-bar-fill';
      fill.style.width = `${(count / total * 100).toFixed(1)}%`;
      track.append(fill); item.append(caption, track); target.append(item);
    });
  }
  render([]);
  window.addEventListener('nig:workspace-records', event => {
    const { key, items } = event.detail || {};
    if (key === kind && Array.isArray(items)) render(items);
  });
})();
