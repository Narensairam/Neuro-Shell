import os
import re

files = [
    'c:/Users/naren/OneDrive/Desktop/shellplc/frontend/src/components/itops/ITSMHubView.jsx',
    'c:/Users/naren/OneDrive/Desktop/shellplc/frontend/src/components/itops/OTThreatView.jsx',
    'c:/Users/naren/OneDrive/Desktop/shellplc/frontend/src/components/itops/PredictiveMonitoringView.jsx',
    'c:/Users/naren/OneDrive/Desktop/shellplc/frontend/src/components/itops/ShadowITView.jsx'
]

replacements = [
    (r'font-mono\s*', ''),
    (r'text-\[9px\]\s*', 'text-xs '),
    (r'text-\[10px\]\s*', 'text-sm '),
    (r'text-\[8px\]\s*', 'text-xs '),
    (r'font-black\s*', 'font-semibold '),
    (r'font-extrabold\s*', 'font-semibold '),
    (r'uppercase\s*', ''),
    (r'tracking-widest\s*', ''),
    (r'tracking-tight\s*', ''),
    (r'tracking-tighter\s*', ''),
    (r'italic\s*', ''),
    (r'text-shell-darkText', 'text-gray-900'),
    (r'bg-shell-darkText', 'bg-gray-900'),
    (r'hover:text-shell-darkText', 'hover:text-gray-900'),
    (r'hover:bg-shell-darkText', 'hover:bg-gray-900'),
]

timeout_code = """
const fetchWithTimeout = async (url, options = {}) => {
  const timeout = options.timeout || 2000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};
"""

for fpath in files:
    if not os.path.exists(fpath): continue
    
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for pat, rep in replacements:
        content = re.sub(pat, rep, content)
    
    # Clean up double spaces in classNames
    content = re.sub(r' +', ' ', content)
    
    if 'fetchWithTimeout' not in content:
        content = content.replace("const API = 'http://localhost:5004';", "const API = 'http://localhost:5004';\n" + timeout_code)
    
    content = content.replace('await fetch(', 'await fetchWithTimeout(')
    content = content.replace('fetch(`${API}', 'fetchWithTimeout(`${API}')
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done updating fonts, styles, and fetch timeouts.")
