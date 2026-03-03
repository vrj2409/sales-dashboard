import streamlit as st
from pathlib import Path
import re

# Set page config
st.set_page_config(
    page_title="Sales Intelligence Dashboard",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Hide Streamlit branding
st.markdown("""
<style>
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}
.block-container {padding: 0 !important; max-width: 100% !important;}
iframe {border: none !important;}
</style>
""", unsafe_allow_html=True)

# Read the HTML file
dist_path = Path(__file__).parent / "dist"
index_path = dist_path / "index.html"

if index_path.exists():
    with open(index_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Find and read CSS file
    css_match = re.search(r'href="\.\/assets\/(index-[^"]+\.css)"', html_content)
    if css_match:
        css_file = dist_path / "assets" / css_match.group(1)
        with open(css_file, 'r', encoding='utf-8') as f:
            css_content = f.read()
        # Replace CSS link with inline style
        html_content = re.sub(
            r'<link rel="stylesheet"[^>]+href="\.\/assets\/[^"]+"[^>]*>',
            f'<style>{css_content}</style>',
            html_content
        )
    
    # Find and read JS file
    js_match = re.search(r'src="\.\/assets\/(index-[^"]+\.js)"', html_content)
    if js_match:
        js_file = dist_path / "assets" / js_match.group(1)
        with open(js_file, 'r', encoding='utf-8') as f:
            js_content = f.read()
        # Replace JS script with inline script
        html_content = re.sub(
            r'<script type="module"[^>]+src="\.\/assets\/[^"]+"[^>]*></script>',
            f'<script type="module">{js_content}</script>',
            html_content
        )
    
    # Read and inject data.json
    data_file = dist_path / "data.json"
    if data_file.exists():
        with open(data_file, 'r', encoding='utf-8') as f:
            data_content = f.read()
        # Inject data before the main script
        html_content = html_content.replace(
            '<script type="module">',
            f'<script>window.__DATA__ = {data_content};</script><script type="module">',
            1
        )
    
    # Display the dashboard
    st.components.v1.html(html_content, height=1200, scrolling=True)
else:
    st.error(f"Dashboard not found. Please ensure the dist folder exists with index.html")
