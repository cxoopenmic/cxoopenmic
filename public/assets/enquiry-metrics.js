(() => {
  if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return;
  const pages = new Set(['/', '/radar/', '/amplify/', '/resonance/']);
  const page = location.pathname;
  if (!pages.has(page)) return;
  const record = (event, topic = '') => {
    fetch('/contact/metrics', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      credentials: 'omit', keepalive: true, body: JSON.stringify({ page, event, topic })
    }).catch(() => {});
  };
  let viewed = false;
  const view = () => { if (!viewed && document.visibilityState === 'visible') { viewed = true; record('page_view'); } };
  view();
  document.addEventListener('visibilitychange', view);
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || !['/contact', '/sponsorship'].includes(url.pathname)) return;
    record('cta_click', url.pathname === '/sponsorship' ? 'sponsorship' : url.searchParams.get('topic') || 'general');
  });
})();
