
"""
Self-diagnostics and preflight check module for EirosShell
"""

import importlib
import os
import platform
import subprocess
import sys
import logging
from pathlib import Path
from typing import Dict, List, Tuple, Optional

logger = logging.getLogger("EirosShell")

class DiagnosticsResult:
    """Results of diagnostic tests"""
    def __init__(self):
        self.passed = True
        self.results = []
        
    def add_result(self, test_name: str, passed: bool, message: str):
        """Add a test result"""
        self.results.append({
            "test": test_name,
            "passed": passed,
            "message": message
        })
        if not passed:
            self.passed = False
            
    def get_summary(self) -> str:
        """Get a summary of test results"""
        passed = sum(1 for r in self.results if r["passed"])
        total = len(self.results)
        
        summary = f"Preflight Check Summary: {passed}/{total} tests passed\n\n"
        
        for result in self.results:
            status = "✅ PASS" if result["passed"] else "❌ FAIL"
            summary += f"{status} - {result['test']}: {result['message']}\n"
            
        if not self.passed:
            summary += "\nSome tests failed. Please fix the issues before continuing."
            
        return summary

def check_dependencies() -> Tuple[bool, str]:
    """Check if all required dependencies are installed"""
    try:
        requirements_file = "requirements.txt"
        if not os.path.exists(requirements_file):
            return False, "requirements.txt file not found"
            
        with open(requirements_file, "r") as f:
            required_packages = [
                line.strip().split("==")[0].split(">=")[0].split("<=")[0]
                for line in f.readlines()
                if line.strip() and not line.startswith("#")
            ]
            
        missing_packages = []
        
        for package in required_packages:
            try:
                importlib.import_module(package.replace("-", "_"))
            except ImportError:
                missing_packages.append(package)
                
        if missing_packages:
            return False, f"Missing packages: {', '.join(missing_packages)}"
        else:
            return True, "All required packages are installed"
    except Exception as e:
        return False, f"Error checking dependencies: {str(e)}"

def check_filesystem_access() -> Tuple[bool, str]:
    """Check if the application has proper file system access"""
    try:
        # Create test directories
        test_dirs = [
            Path(os.path.expanduser("~")) / "EirosShell" / "logs",
            Path(os.path.expanduser("~")) / "EirosShell" / "screenshots",
            Path(os.path.expanduser("~")) / "EirosShell" / "patterns"
        ]
        
        for directory in test_dirs:
            directory.mkdir(parents=True, exist_ok=True)
            
        # Create and delete a test file
        test_file = test_dirs[0] / "test_file.txt"
        with open(test_file, "w") as f:
            f.write("Test file write access")
            
        os.remove(test_file)
        
        return True, "File system access verified (read/write)"
    except Exception as e:
        return False, f"File system access error: {str(e)}"

def check_browser_launch() -> Tuple[bool, str]:
    """Check if browser can be launched"""
    try:
        playwright_installed = False
        try:
            import playwright
            playwright_installed = True
        except ImportError:
            return False, "Playwright not installed, cannot check browser launch"
            
        if playwright_installed:
            from playwright.sync_api import sync_playwright
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                browser.close()
                
        return True, "Browser launch capability verified"
    except Exception as e:
        return False, f"Browser launch error: {str(e)}"

def check_admin_rights() -> Tuple[bool, str]:
    """Check if running with admin/sudo privileges"""
    try:
        is_admin = False
        
        if platform.system() == "Windows":
            try:
                import ctypes
                is_admin = ctypes.windll.shell32.IsUserAnAdmin() != 0
            except:
                is_admin = False
        else:  # Linux/macOS
            is_admin = os.geteuid() == 0 if hasattr(os, "geteuid") else False
            
        status = "Running with admin privileges" if is_admin else "Running without admin privileges"
        # This is not a critical check, always return true
        return True, status
    except Exception as e:
        return True, f"Could not determine admin status: {str(e)}"

def check_modules_integrity() -> Tuple[bool, str]:
    """Check if core modules are present and importable"""
    core_modules = [
        "browser_driver",
        "chat_connector",
        "command_executor",
        "openai_login_handler",
        "parser_service",
        "pattern_matcher",
        "utils"
    ]
    
    missing_modules = []
    
    for module_name in core_modules:
        try:
            importlib.import_module(module_name)
        except ImportError:
            missing_modules.append(module_name)
            
    if missing_modules:
        return False, f"Missing core modules: {', '.join(missing_modules)}"
    else:
        return True, "All core modules verified"

def run_preflight_checks(debug_mode: bool = False) -> DiagnosticsResult:
    """Run all preflight checks and return the result"""
    if debug_mode:
        logger.info("Running preflight checks in debug mode...")
    else:
        logger.info("Running preflight checks...")
        
    result = DiagnosticsResult()
    
    # Run all checks
    checks = [
        ("Dependencies", check_dependencies()),
        ("File System Access", check_filesystem_access()),
        ("Browser Launch", check_browser_launch()),
        ("Admin Rights", check_admin_rights()),
        ("Modules Integrity", check_modules_integrity())
    ]
    
    for check_name, (passed, message) in checks:
        result.add_result(check_name, passed, message)
        if debug_mode:
            status = "PASSED" if passed else "FAILED"
            logger.info(f"Check '{check_name}': {status} - {message}")
    
    return result

