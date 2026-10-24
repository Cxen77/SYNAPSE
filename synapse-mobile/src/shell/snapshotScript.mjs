// Runs only inside our own website. Snapshots are inert documents, not a second
// copy of the app: scripts, credentials, forms and network calls are excluded.
export function createBootstrapScript(deviceId) {
  return `window.SynapseNative = Object.assign(window.SynapseNative || {}, {version: 1, deviceId: ${JSON.stringify(deviceId)}});
    window.dispatchEvent(new Event('synapse:native-ready')); true;`;
}

export const captureSnapshotScript = `(() => {
  if (!window.SynapseNative || !('userId' in window.SynapseNative) || !window.ReactNativeWebView) return true;
  if (/^\\/(login|signup|verify-email|forgot-password|reset-password|settings|admin|moderator|organizer|certificate)(\\/|$)/.test(location.pathname)) return true;
  const root = document.body.cloneNode(true);
  const originals = [...document.images];
  root.querySelectorAll('img').forEach((image, index) => {
    const live = originals[index];
    if (live && live.complete && live.naturalWidth > 0) image.setAttribute('data-offline-source', live.currentSrc || live.src);
  });
  root.querySelectorAll('script,iframe,object,embed,form,input,textarea,select,video,audio,canvas,meta,link,base,[data-native-private]').forEach(node => node.remove());
  [root, ...root.querySelectorAll('*')].forEach(node => {
    [...node.attributes].forEach(attribute => {
      if (/^on/i.test(attribute.name) || ['nonce','integrity','srcdoc','contenteditable','autofocus'].includes(attribute.name)) node.removeAttribute(attribute.name);
    });
    if (node.tagName === 'A') {node.removeAttribute('href'); node.removeAttribute('target');}
    if (node.tagName === 'BUTTON') node.setAttribute('disabled', '');
  });
  const assets = [];
  root.querySelectorAll('img').forEach(image => {
    const src = image.getAttribute('data-offline-source');
    image.removeAttribute('data-offline-source');
    image.removeAttribute('srcset'); image.removeAttribute('sizes'); image.removeAttribute('src');
    if (src && /^https:\\/\\//.test(src) && assets.length < 24) {
      const marker = 'SYNAPSE_OFFLINE_IMAGE_' + assets.length;
      assets.push({marker, url: src}); image.setAttribute('src', marker);
    } else if (src && /^data:image\\/(?:png|jpeg|webp|gif);base64,/.test(src) && src.length < 100000) image.setAttribute('src', src);
    image.removeAttribute('loading');
  });
  let css = '';
  for (const sheet of document.styleSheets) {
    try {css += [...sheet.cssRules].map(rule => rule.cssText).join('\\n');} catch { /* Cross-origin styles are not copied. */ }
  }
  css = css.replace(/@import[^;]+;/gi, '').replace(/url\\([^)]*\\)/gi, 'none').replace(/<\\/style/gi, '');
  const escape = value => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const html = '<!doctype html><html class="' + escape(document.documentElement.className) + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; img-src file: data:; style-src &#39;unsafe-inline&#39;; font-src data:; form-action &#39;none&#39;; base-uri &#39;none&#39;"><title>' + escape(document.title) + '</title><style>' + css + '\\n button,a{pointer-events:none!important} body{padding-bottom:32px}</style></head>' + root.outerHTML + '</html>';
  if (html.length < 1800000) window.ReactNativeWebView.postMessage(JSON.stringify({version:1,type:'snapshot',url:location.href,title:document.title,html,assets,userId:window.SynapseNative.userId || null}));
  return true;
})(); true;`;
