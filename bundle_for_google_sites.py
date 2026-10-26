import os
import re

def bundle():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    index_path = os.path.join(base_dir, 'index.html')
    styles_path = os.path.join(base_dir, 'styles.css')
    script_path = os.path.join(base_dir, 'script.js')
    output_path = os.path.join(base_dir, 'google_sites_embed.html')

    with open(index_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    with open(styles_path, 'r', encoding='utf-8') as f:
        css_content = f.read()

    with open(script_path, 'r', encoding='utf-8') as f:
        js_content = f.read()

    # In-memory storage shim for Google Sites sandboxed iframes
    storage_shim = """
  // =========================================================================
  // Google Sites Sandboxed Iframe Resilience Shim
  // Guarantees localStorage and sessionStorage work without SecurityError
  // =========================================================================
  (function() {
    function createSafeStorage() {
      var store = {};
      return {
        getItem: function(k) { return store.hasOwnProperty(k) ? store[k] : null; },
        setItem: function(k, v) { store[k] = String(v); },
        removeItem: function(k) { delete store[k]; },
        clear: function() { store = {}; }
      };
    }
    try {
      var k = '__test_ls__';
      window.localStorage.setItem(k, k);
      window.localStorage.removeItem(k);
    } catch(e) {
      console.warn('Google Sites sandbox: LocalStorage blocked by policy. Safe in-memory fallback enabled.');
      try {
        Object.defineProperty(window, 'localStorage', {
          value: createSafeStorage(),
          configurable: true,
          writable: true
        });
      } catch(_) {}
    }
    try {
      var sk = '__test_ss__';
      window.sessionStorage.setItem(sk, sk);
      window.sessionStorage.removeItem(sk);
    } catch(e) {
      console.warn('Google Sites sandbox: SessionStorage blocked by policy. Safe in-memory fallback enabled.');
      try {
        Object.defineProperty(window, 'sessionStorage', {
          value: createSafeStorage(),
          configurable: true,
          writable: true
        });
      } catch(_) {}
    }
  })();
"""

    # Replace stylesheet link and script tag
    css_target = '<link rel="stylesheet" href="styles.css">'
    js_target = '<script src="script.js"></script>'

    if css_target in html_content:
        html_bundled = html_content.replace(css_target, f"<style>\n/* === BUNDLED STYLES === */\n{css_content}\n</style>")
    else:
        html_bundled = re.sub(r'<link\s+rel=["\']stylesheet["\']\s+href=["\']styles\.css["\']\s*/?>', lambda m: f"<style>\n/* === BUNDLED STYLES === */\n{css_content}\n</style>", html_content)

    if js_target in html_bundled:
        html_bundled = html_bundled.replace(js_target, f"<script>\n{storage_shim}\n/* === BUNDLED APPLICATION SCRIPT === */\n{js_content}\n</script>")
    else:
        html_bundled = re.sub(r'<script\s+src=["\']script\.js["\']\s*></script>', lambda m: f"<script>\n{storage_shim}\n/* === BUNDLED APPLICATION SCRIPT === */\n{js_content}\n</script>", html_bundled)

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_bundled)

    print(f"Successfully generated single-file bundle for Google Sites at: {output_path}")
    print(f"File size: {os.path.getsize(output_path):,} bytes")

if __name__ == '__main__':
    bundle()
