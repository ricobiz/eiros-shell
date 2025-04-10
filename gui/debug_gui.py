
"""
Main debug GUI module for EirosShell
Provides a visual interface for monitoring and debugging
"""

import sys
import os
import logging
import time
from queue import Queue
from threading import Thread
from datetime import datetime

try:
    from PyQt5 import QtWidgets
    from PyQt5.QtCore import Qt
except ImportError:
    print("PyQt5 is not installed. Install it with: pip install PyQt5")
    print("Then restart EirosShell with: python start_eiros_shell.py")
    sys.exit(1)

from .log_handler import LogQueueHandler
from .debug_window import DebugWindow

# Configure logger for this module
logger = logging.getLogger("EirosShell.DebugGUI")

class DebugGUI:
    """Main class to manage the debug GUI"""
    
    def __init__(self):
        self.app = None
        self.window = None
        self.log_queue = Queue()
        self.running = False
        
    def setup_logging(self):
        """Set up logging to capture logs for the GUI"""
        root_logger = logging.getLogger("EirosShell")
        
        # Create our custom handler
        handler = LogQueueHandler(self.log_queue)
        formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
        handler.setFormatter(formatter)
        
        # Add it to the root logger
        root_logger.addHandler(handler)
        
    def start_in_thread(self):
        """Start the GUI in a separate thread"""
        self.gui_thread = Thread(target=self.start, daemon=True)
        self.gui_thread.start()
        return self.gui_thread
        
    def start(self):
        """Start the GUI application"""
        self.running = True
        self.app = QtWidgets.QApplication(sys.argv)
        self.window = DebugWindow()
        self.window.show()
        
        # Start log processing
        log_thread = Thread(target=self.process_logs, daemon=True)
        log_thread.start()
        
        # Set up logging
        self.setup_logging()
        
        # Run the application
        self.app.exec_()
        self.running = False
        
    def process_logs(self):
        """Process logs from the queue and update the GUI"""
        while self.running:
            try:
                # Process all available logs
                while not self.log_queue.empty():
                    log_data = self.log_queue.get()
                    
                    # Check if this is a command result
                    if 'command_id' in log_data:
                        self.window.updateSignal.emit({
                            'command': {
                                'command_id': log_data['command_id'],
                                'command_status': log_data['command_status'],
                                'command_type': log_data.get('command_type', 'unknown'),
                                'message': log_data['message'],
                                'timestamp': log_data['timestamp']
                            }
                        })
                        
                    # Send log to display
                    self.window.updateSignal.emit({'log': log_data})
                    
                # Sleep briefly to avoid consuming too much CPU
                time.sleep(0.1)
            except Exception as e:
                print(f"Error in log processing: {str(e)}")
                time.sleep(1)  # Sleep longer on error
                
    def update_status(self, is_connected, message=""):
        """Update the connection status display"""
        if self.window and self.running:
            self.window.updateSignal.emit({
                'status': {
                    'connected': is_connected,
                    'message': message
                }
            })
            
    def update_current_command(self, command_text):
        """Update the current command display"""
        if self.window and self.running:
            self.window.updateSignal.emit({
                'current_command': command_text
            })
            
    def log_command_result(self, command_id, command_type, status, message):
        """Log a command result to the GUI"""
        if self.window and self.running:
            self.window.updateSignal.emit({
                'command': {
                    'command_id': command_id,
                    'command_type': command_type,
                    'command_status': status,
                    'message': message,
                    'timestamp': datetime.now().strftime('%H:%M:%S')
                }
            })

# Global instance
debug_gui = None

def initialize_debug_gui():
    """Initialize and start the debug GUI"""
    global debug_gui
    
    if debug_gui is None:
        debug_gui = DebugGUI()
        debug_gui.start_in_thread()
        
    return debug_gui

if __name__ == "__main__":
    # Test the GUI directly
    gui = DebugGUI()
    gui.start()
