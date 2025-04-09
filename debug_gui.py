
"""
EirosShell Debug GUI
A visual interface for monitoring and debugging the EirosShell
"""

import sys
import os
import logging
import asyncio
import json
import time
from pathlib import Path
from datetime import datetime
from queue import Queue
from threading import Thread

try:
    from PyQt5 import QtWidgets, QtGui, QtCore
    from PyQt5.QtCore import Qt, pyqtSignal, QSize
    from PyQt5.QtGui import QColor, QIcon, QTextCursor, QFont
except ImportError:
    print("PyQt5 is not installed. Install it with: pip install PyQt5")
    print("Then restart EirosShell with: python start_eiros_shell.py")
    sys.exit(1)

# Configure logger for this module
logger = logging.getLogger("EirosShell.DebugGUI")

class LogQueueHandler(logging.Handler):
    """Handler to forward log records to a queue for the GUI"""
    
    def __init__(self, log_queue):
        super().__init__()
        self.log_queue = log_queue
        
    def emit(self, record):
        try:
            # Format the record
            log_entry = self.format(record)
            # Add timestamp and level for GUI processing
            entry_data = {
                'message': log_entry,
                'levelname': record.levelname,
                'timestamp': datetime.fromtimestamp(record.created).strftime('%H:%M:%S'),
                'raw_record': {
                    'msg': record.msg,
                    'levelname': record.levelname,
                    'created': record.created
                }
            }
            
            # Check if this is a command result
            if hasattr(record, 'command_id') and hasattr(record, 'command_status'):
                entry_data['command_id'] = record.command_id
                entry_data['command_status'] = record.command_status
                entry_data['command_type'] = getattr(record, 'command_type', 'unknown')
            
            self.log_queue.put(entry_data)
        except Exception:
            self.handleError(record)

class CommandTableModel(QtCore.QAbstractTableModel):
    """Model for the command history table"""
    
    def __init__(self, data=None):
        super().__init__()
        self._data = data or []
        self.headers = ["ID", "Type", "Status", "Time"]
        
    def data(self, index, role):
        if not index.isValid():
            return None
            
        if role == Qt.DisplayRole:
            return self._data[index.row()][index.column()]
            
        if role == Qt.BackgroundRole:
            status = self._data[index.row()][2]
            if status == "success":
                return QColor(200, 250, 200)  # Light green
            elif status == "error":
                return QColor(250, 200, 200)  # Light red
            return None
            
        return None
        
    def rowCount(self, parent=None):
        return len(self._data)
        
    def columnCount(self, parent=None):
        return len(self.headers)
        
    def headerData(self, section, orientation, role):
        if role == Qt.DisplayRole and orientation == Qt.Horizontal:
            return self.headers[section]
        return None
        
    def addCommand(self, cmd_data):
        """Add a new command to the top of the table"""
        self.beginInsertRows(QtCore.QModelIndex(), 0, 0)
        # Format: [ID, Type, Status, Time]
        new_row = [
            cmd_data.get('command_id', 'unknown'),
            cmd_data.get('command_type', 'unknown'),
            cmd_data.get('command_status', 'unknown'),
            cmd_data.get('timestamp', datetime.now().strftime('%H:%M:%S'))
        ]
        self._data.insert(0, new_row)
        
        # Keep only the most recent 20 commands
        if len(self._data) > 20:
            self._data.pop()
            
        self.endInsertRows()
        return True

class DebugWindow(QtWidgets.QMainWindow):
    """Main debug window for EirosShell"""
    
    # Signal to update the GUI from non-GUI threads
    updateSignal = pyqtSignal(dict)
    
    def __init__(self):
        super().__init__()
        self.setWindowTitle("EirosShell Debug Panel")
        self.resize(1000, 600)
        self.command_details = {}  # Store full command details by ID
        
        # Initialize UI
        self.initUI()
        
        # Connect signal
        self.updateSignal.connect(self.updateFromSignal)
        
    def initUI(self):
        # Main widget and layout
        main_widget = QtWidgets.QWidget()
        main_layout = QtWidgets.QHBoxLayout(main_widget)
        
        # Left panel - Command History
        left_panel = QtWidgets.QGroupBox("Command History")
        left_layout = QtWidgets.QVBoxLayout(left_panel)
        
        # Command table
        self.command_table = QtWidgets.QTableView()
        self.command_model = CommandTableModel()
        self.command_table.setModel(self.command_model)
        self.command_table.setSelectionBehavior(QtWidgets.QAbstractItemView.SelectRows)
        self.command_table.horizontalHeader().setSectionResizeMode(QtWidgets.QHeaderView.Stretch)
        self.command_table.clicked.connect(self.on_command_selected)
        left_layout.addWidget(self.command_table)
        
        # Middle panel - Logs
        mid_panel = QtWidgets.QGroupBox("Logs")
        mid_layout = QtWidgets.QVBoxLayout(mid_panel)
        
        # Log text area
        self.log_text = QtWidgets.QTextEdit()
        self.log_text.setReadOnly(True)
        self.log_text.document().setMaximumBlockCount(500)  # Limit lines to prevent memory issues
        font = QFont("Consolas" if os.name == 'nt' else "Monospace")
        font.setPointSize(9)
        self.log_text.setFont(font)
        mid_layout.addWidget(self.log_text)
        
        # Right panel - Actions
        right_panel = QtWidgets.QGroupBox("Actions")
        right_layout = QtWidgets.QVBoxLayout(right_panel)
        
        # Action buttons
        self.btn_send_log = QtWidgets.QPushButton("📤 Send Log to Chat")
        self.btn_restart = QtWidgets.QPushButton("🔁 Restart EirosShell")
        self.btn_open_logs = QtWidgets.QPushButton("📂 Open Log Folder")
        self.btn_pause = QtWidgets.QPushButton("⏸️ Pause Execution")
        self.btn_test = QtWidgets.QPushButton("🎯 Test Command")
        
        # Connect button signals
        self.btn_send_log.clicked.connect(self.on_send_log)
        self.btn_restart.clicked.connect(self.on_restart)
        self.btn_open_logs.clicked.connect(self.on_open_logs)
        self.btn_pause.clicked.connect(self.on_pause)
        self.btn_test.clicked.connect(self.on_test_command)
        
        # Add buttons to layout
        right_layout.addWidget(self.btn_send_log)
        right_layout.addWidget(self.btn_restart)
        right_layout.addWidget(self.btn_open_logs)
        right_layout.addWidget(self.btn_pause)
        right_layout.addWidget(self.btn_test)
        right_layout.addStretch(1)  # Add space at bottom
        
        # Add all panels to main layout
        main_layout.addWidget(left_panel, 1)  # 25% width
        main_layout.addWidget(mid_panel, 2)    # 50% width
        main_layout.addWidget(right_panel, 1)  # 25% width
        
        # Status bar at the bottom
        self.status_bar = self.statusBar()
        self.current_command_label = QtWidgets.QLabel("No active command")
        self.connection_status = QtWidgets.QLabel("Status: Initializing...")
        self.status_bar.addPermanentWidget(self.current_command_label, 1)
        self.status_bar.addPermanentWidget(self.connection_status)
        
        # Set central widget
        self.setCentralWidget(main_widget)
        
    def updateFromSignal(self, data):
        """Update UI based on signal data"""
        
        if 'log' in data:
            self.append_log(data['log'])
            
        if 'command' in data:
            self.update_command(data['command'])
            
        if 'status' in data:
            self.update_status(data['status'])
            
        if 'current_command' in data:
            self.current_command_label.setText(f"Current DSL: {data['current_command']}")
            
    def append_log(self, log_data):
        """Add a new log entry to the text area with appropriate formatting"""
        cursor = self.log_text.textCursor()
        cursor.movePosition(QTextCursor.End)
        self.log_text.setTextCursor(cursor)
        
        # Format log with timestamp and color based on level
        timestamp = log_data.get('timestamp', time.strftime('%H:%M:%S'))
        level = log_data.get('levelname', 'INFO')
        message = log_data.get('message', '')
        
        # Set text color based on log level
        if level == 'ERROR':
            self.log_text.setTextColor(QColor(255, 0, 0))  # Red
        elif level == 'WARNING':
            self.log_text.setTextColor(QColor(255, 165, 0))  # Orange
        elif level == 'SUCCESS':
            self.log_text.setTextColor(QColor(0, 128, 0))  # Green
        else:
            self.log_text.setTextColor(QColor(0, 0, 0))  # Black
            
        self.log_text.insertPlainText(f"[{timestamp}] {level}: {message}\n")
        
        # Auto-scroll to the bottom
        self.log_text.verticalScrollBar().setValue(self.log_text.verticalScrollBar().maximum())
        
    def update_command(self, cmd_data):
        """Update command table with new command data"""
        # Store full command details
        cmd_id = cmd_data.get('command_id', 'unknown')
        self.command_details[cmd_id] = cmd_data
        
        # Add to table model
        self.command_model.addCommand(cmd_data)
        
    def update_status(self, status):
        """Update connection status display"""
        if status.get('connected', False):
            self.connection_status.setText("Status: Connected ✅")
            self.connection_status.setStyleSheet("color: green")
        else:
            self.connection_status.setText(f"Status: {status.get('message', 'Disconnected')} ❌")
            self.connection_status.setStyleSheet("color: red")
            
    def on_command_selected(self, index):
        """Show details when a command is selected"""
        row = index.row()
        cmd_id = self.command_model._data[row][0]
        
        if cmd_id in self.command_details:
            details = self.command_details[cmd_id]
            # Display command details in a dialog
            detail_dialog = QtWidgets.QDialog(self)
            detail_dialog.setWindowTitle(f"Command Details: {cmd_id}")
            detail_dialog.resize(500, 400)
            
            layout = QtWidgets.QVBoxLayout(detail_dialog)
            
            # Format JSON for display
            try:
                formatted_json = json.dumps(details, indent=2)
            except:
                formatted_json = str(details)
                
            # Text area for details
            text_area = QtWidgets.QTextEdit()
            text_area.setReadOnly(True)
            text_area.setPlainText(formatted_json)
            font = QFont("Consolas" if os.name == 'nt' else "Monospace")
            font.setPointSize(9)
            text_area.setFont(font)
            
            layout.addWidget(text_area)
            
            # Close button
            btn_close = QtWidgets.QPushButton("Close")
            btn_close.clicked.connect(detail_dialog.close)
            layout.addWidget(btn_close)
            
            detail_dialog.exec_()
            
    def on_send_log(self):
        """Send last 10 log lines to chat"""
        # This will be implemented with chat_connector integration
        last_logs = self.log_text.toPlainText().split('\n')[-10:]
        log_text = '\n'.join(last_logs)
        
        QtWidgets.QMessageBox.information(
            self,
            "Log Sent",
            f"The following log would be sent to chat:\n\n{log_text}"
        )
        
    def on_restart(self):
        """Restart the EirosShell"""
        reply = QtWidgets.QMessageBox.question(
            self, 
            'Restart Confirmation',
            'Are you sure you want to restart EirosShell?',
            QtWidgets.QMessageBox.Yes | QtWidgets.QMessageBox.No,
            QtWidgets.QMessageBox.No
        )
        
        if reply == QtWidgets.QMessageBox.Yes:
            # Signal the main process to restart
            logger.info("Restart requested from GUI")
            # This will be implemented with main process integration
            
    def on_open_logs(self):
        """Open the logs folder"""
        log_dir = Path(os.path.expanduser("~")) / "EirosShell" / "logs"
        
        if not log_dir.exists():
            QtWidgets.QMessageBox.warning(
                self, 
                "Folder Not Found",
                f"Log folder not found: {log_dir}"
            )
            return
            
        # Open folder in file explorer
        if os.name == 'nt':  # Windows
            os.startfile(log_dir)
        elif os.name == 'posix':  # macOS or Linux
            if sys.platform == 'darwin':  # macOS
                os.system(f'open "{log_dir}"')
            else:  # Linux
                os.system(f'xdg-open "{log_dir}"')
                
    def on_pause(self):
        """Pause/Resume execution"""
        if self.btn_pause.text().startswith("⏸️"):
            self.btn_pause.setText("▶️ Resume Execution")
            # Signal to pause
            logger.info("Execution paused from GUI")
        else:
            self.btn_pause.setText("⏸️ Pause Execution")
            # Signal to resume
            logger.info("Execution resumed from GUI")
            
    def on_test_command(self):
        """Open dialog to test a command"""
        test_dialog = QtWidgets.QDialog(self)
        test_dialog.setWindowTitle("Test Command")
        test_dialog.resize(500, 300)
        
        layout = QtWidgets.QVBoxLayout(test_dialog)
        
        # Command type selector
        layout.addWidget(QtWidgets.QLabel("Command Type:"))
        cmd_type = QtWidgets.QComboBox()
        cmd_type.addItems(["click", "type", "navigation", "wait", "screenshot", "analyze"])
        layout.addWidget(cmd_type)
        
        # Command parameters
        layout.addWidget(QtWidgets.QLabel("Parameters (JSON):"))
        params_text = QtWidgets.QTextEdit()
        params_text.setPlainText('{\n  "selector": "#example",\n  "waitAfter": 500\n}')
        layout.addWidget(params_text)
        
        # Buttons
        btn_layout = QtWidgets.QHBoxLayout()
        btn_execute = QtWidgets.QPushButton("Execute")
        btn_cancel = QtWidgets.QPushButton("Cancel")
        btn_execute.clicked.connect(lambda: self.execute_test_command(
            cmd_type.currentText(), 
            params_text.toPlainText(),
            test_dialog
        ))
        btn_cancel.clicked.connect(test_dialog.close)
        btn_layout.addWidget(btn_execute)
        btn_layout.addWidget(btn_cancel)
        layout.addLayout(btn_layout)
        
        test_dialog.exec_()
        
    def execute_test_command(self, cmd_type, params_json, dialog):
        """Execute a test command"""
        try:
            params = json.loads(params_json)
            # This will be implemented with command execution integration
            logger.info(f"Test command: {cmd_type} with params: {params}")
            QtWidgets.QMessageBox.information(
                self,
                "Command Queued",
                f"Command {cmd_type} has been queued for execution"
            )
            dialog.accept()
        except json.JSONDecodeError:
            QtWidgets.QMessageBox.warning(
                self,
                "Invalid JSON",
                "The parameters are not valid JSON. Please check and try again."
            )

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
