"""Compatibility entry point for expanded offline workspace regressions.
Storage/provider mocked; requires existing Python Playwright + Chromium.
"""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).with_name("workspace_dom_check.py")), run_name="__main__")
