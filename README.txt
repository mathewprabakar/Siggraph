# ---- project layout ----
# The app is served over HTTP (GitHub Pages), so it is split across files rather
# than inlined into one index.html:
#   index.html                  markup shell; references the CSS/JS below
#   styles/app.css              page styles
#   js/app.js                   application logic (ES module)
#   js/qr.js                    vendored QR-code encoder (imported by app.js)
#   siggraph2026-catalog.json   session catalog — fetched at startup (single source
#                               of truth; written by refresh_siggraph.py)
#   lacc-level1.svg / -2.svg    floor-plan maps — fetched on demand when the map opens
#
# Because it uses fetch()/ES modules, it must be SERVED, not opened as a file://.
# Local dev:  python -m http.server   (then open http://localhost:8000/)

uv lock

# refresh the catalog (siggraph2026-catalog.json) — the app fetches it automatically

# file mode (saved page)
uv run refresh_siggraph.py "Full Schedule - SIGGRAPH 2026 ....htm"

# with lxml
uv sync --extra fast
uv run refresh_siggraph.py page.htm

# live render mode
uv sync --extra render
uv run playwright install chromium
uv run refresh_siggraph.py --render

# after changing index.html: layout + functional smoke tests (Chromium + WebKit)
uv sync --extra test
uv run playwright install chromium webkit
uv run check_page.py

