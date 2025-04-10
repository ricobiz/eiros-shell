
"""
Table model for the command history display in the Debug GUI
"""

from PyQt5 import QtCore
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QColor

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
