
"""
Main debug window implementation for EirosShell
"""

import os
import json
import sys
from datetime import datetime
from pathlib import Path

from PyQt5 import QtWidgets, QtGui, QtCore
from PyQt5.QtCore import Qt, pyqtSignal, QSize
from PyQt5.QtGui import QColor, QIcon, QTextCursor, QFont

from .command_table import CommandTableModel

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
        timestamp = log_data.get('timestamp', datetime.now().strftime('%H:%M:%S'))
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
            import logging
            logger = logging.getLogger("EirosShell")
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
            import logging
            logger = logging.getLogger("EirosShell")
            logger.info("Execution paused from GUI")
        else:
            self.btn_pause.setText("⏸️ Pause Execution")
            # Signal to resume
            import logging
            logger = logging.getLogger("EirosShell")
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
            import logging
            logger = logging.getLogger("EirosShell")
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
