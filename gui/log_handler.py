
"""
Custom log handlers for the debug GUI
"""

import logging
from queue import Queue
from datetime import datetime

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
