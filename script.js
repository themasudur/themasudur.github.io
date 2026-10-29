'use strict';
// Content is pre-rendered; JavaScript only enhances navigation and filtering.
document.querySelectorAll('.js-only').forEach(el => { el.hidden = false; });
document.querySelector('[data-print]')?.addEventListener('click', () => window.print());
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
menu?.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(expanded));
  nav.classList.toggle('is-open', expanded);
});
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('is-open');
  menu?.setAttribute('aria-expanded', 'false');
}));
const archive = document.querySelector('#all-publications');
const search = document.querySelector('#pub-search');
const area = document.querySelector('#area-filter');
const type = document.querySelector('#type-filter');
const rows = [...document.querySelectorAll('#publication-list .pub-row')];
function filterPublications() {
  if (!search || !area || !type) return;
  const query = search.value.trim().toLowerCase();
  let count = 0;
  rows.forEach(row => {
    const match = (!query || row.dataset.search.includes(query)) &&
      (area.value === 'all' || row.dataset.area === area.value) &&
      (type.value === 'all' || row.dataset.type === type.value);
    row.hidden = !match;
    if (match) count++;
  });
  document.querySelector('#result-count').textContent = `Showing ${count} of ${rows.length} works`;
  document.querySelector('#empty-state').hidden = count !== 0;
}
search?.addEventListener('input', filterPublications);
area?.addEventListener('change', filterPublications);
type?.addEventListener('change', filterPublications);
document.querySelector('#reset-filters')?.addEventListener('click', () => {
  search.value = ''; area.value = 'all'; type.value = 'all'; filterPublications(); search.focus();
});
document.querySelectorAll('.theme[data-area]').forEach(theme => theme.addEventListener('click', e => {
  e.preventDefault(); archive.open = true; search.value = ''; type.value = 'all';
  area.value = theme.dataset.area; filterPublications();
  history.replaceState(null, '', '#all-publications');
  archive.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  area.focus({preventScroll: true});
}));
function openLinkedDetails() {
  if (location.hash === '#all-publications' || location.hash.startsWith('#pub-')) {
    if (archive) archive.open = true;
  }
}
openLinkedDetails();
window.addEventListener('hashchange', openLinkedDetails);
const dialog = document.querySelector('#citation-dialog');
const citationData = document.querySelector('#citations-data');
if (dialog && citationData) {
  const citations = JSON.parse(citationData.textContent);
  const citationText = document.querySelector('#citation-text');
  const status = document.querySelector('#copy-status');
  document.querySelectorAll('[data-cite]').forEach(button => button.addEventListener('click', () => {
    citationText.textContent = citations[button.dataset.cite]; status.textContent = '';
    dialog.showModal();
  }));
  document.querySelector('#close-citation').addEventListener('click', () => dialog.close());
  document.querySelector('#copy-citation').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(citationText.textContent);
      status.textContent = 'Copied.';
    } catch {
      const range = document.createRange(); range.selectNodeContents(citationText);
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      status.textContent = 'Text selected. Press Ctrl+C or ⌘C to copy.';
    }
  });
}
if ('IntersectionObserver' in window && nav) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      nav.querySelectorAll('a').forEach(link => {
        if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    });
  }, {rootMargin: '-15% 0px -65% 0px'});
  document.querySelectorAll('main>section[id]').forEach(section => observer.observe(section));
}
