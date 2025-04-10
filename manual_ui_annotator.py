
"""
Manual UI annotation module for EirosShell
Allows users to manually annotate and save UI elements
"""

import logging
import json
import os
import tkinter as tk
from tkinter import ttk, filedialog
from PIL import Image, ImageTk
import base64
import io
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import time
import re

from pattern_storage import PatternStorage

logger = logging.getLogger("EirosShell")

class ManualAnnotator:
    """
    GUI tool for manually annotating UI elements on screenshots
    """
    
    def __init__(self):
        self.storage = PatternStorage()
        self.root = None
        self.canvas = None
        self.img = None
        self.photo = None
        self.image_path = None
        self.current_element = None
        self.elements = {}
        self.markers = {}
        self.screenshot_data = None
        self.current_url = "unknown"
        self.annotation_active = False
        self.start_x, self.start_y = 0, 0
        self.rect_id = None
        self.context = "manual"
        
    def start(self, screenshot_path: Optional[str] = None, url: Optional[str] = None):
        """Start the annotation tool with an optional screenshot"""
        if self.root:
            # If window is already open, bring to front
            self.root.lift()
            self.root.focus_force()
            if screenshot_path:
                self.load_image(screenshot_path)
            return
        
        # Set URL if provided
        if url:
            self.current_url = url
        
        # Create main window
        self.root = tk.Tk()
        self.root.title("EirosShell - Manual UI Annotation")
        self.root.geometry("900x700")
        self.root.minsize(800, 600)
        
        # Create main frame
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Top control bar
        control_frame = ttk.Frame(main_frame)
        control_frame.pack(fill=tk.X, side=tk.TOP, pady=(0, 10))
        
        # Load screenshot button
        load_btn = ttk.Button(control_frame, text="Load Screenshot", command=self.browse_image)
        load_btn.pack(side=tk.LEFT, padx=5)
        
        # URL Entry
        ttk.Label(control_frame, text="Current URL:").pack(side=tk.LEFT, padx=(10, 5))
        self.url_entry = ttk.Entry(control_frame, width=40)
        self.url_entry.pack(side=tk.LEFT, padx=5)
        self.url_entry.insert(0, self.current_url)
        
        # Update URL button
        update_url_btn = ttk.Button(control_frame, text="Update URL", command=self.update_url)
        update_url_btn.pack(side=tk.LEFT, padx=5)
        
        # Start/Stop annotating button
        self.annotate_btn = ttk.Button(control_frame, text="Start Annotating", command=self.toggle_annotation)
        self.annotate_btn.pack(side=tk.LEFT, padx=5)
        
        # Save all button
        save_btn = ttk.Button(control_frame, text="Save All Elements", command=self.save_all_elements)
        save_btn.pack(side=tk.LEFT, padx=5)
        
        # Split frame for canvas and element list
        split_frame = ttk.PanedWindow(main_frame, orient=tk.HORIZONTAL)
        split_frame.pack(fill=tk.BOTH, expand=True)
        
        # Left side - Canvas for screenshot
        canvas_frame = ttk.Frame(split_frame)
        split_frame.add(canvas_frame, weight=3)
        
        # Canvas for displaying the image
        self.canvas = tk.Canvas(canvas_frame, bg="gray90", cursor="crosshair")
        self.canvas.pack(fill=tk.BOTH, expand=True)
        
        # Canvas scrollbars
        h_scrollbar = ttk.Scrollbar(canvas_frame, orient=tk.HORIZONTAL, command=self.canvas.xview)
        v_scrollbar = ttk.Scrollbar(canvas_frame, orient=tk.VERTICAL, command=self.canvas.yview)
        h_scrollbar.pack(fill=tk.X, side=tk.BOTTOM)
        v_scrollbar.pack(fill=tk.Y, side=tk.RIGHT)
        self.canvas.configure(xscrollcommand=h_scrollbar.set, yscrollcommand=v_scrollbar.set)
        
        # Canvas events
        self.canvas.bind("<ButtonPress-1>", self.on_mouse_down)
        self.canvas.bind("<B1-Motion>", self.on_mouse_drag)
        self.canvas.bind("<ButtonRelease-1>", self.on_mouse_up)
        
        # Right side - Element list and properties
        element_frame = ttk.Frame(split_frame)
        split_frame.add(element_frame, weight=1)
        
        # Element list
        list_frame = ttk.LabelFrame(element_frame, text="Annotated Elements")
        list_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Element list with scrollbar
        list_scroll = ttk.Scrollbar(list_frame)
        list_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.element_list = tk.Listbox(list_frame, yscrollcommand=list_scroll.set, exportselection=0)
        self.element_list.pack(fill=tk.BOTH, expand=True)
        list_scroll.config(command=self.element_list.yview)
        self.element_list.bind("<<ListboxSelect>>", self.on_element_select)
        
        # Element properties
        prop_frame = ttk.LabelFrame(element_frame, text="Element Properties")
        prop_frame.pack(fill=tk.X, padx=5, pady=5)
        
        # Element name
        ttk.Label(prop_frame, text="Element Name:").pack(anchor=tk.W, padx=5, pady=(5, 0))
        self.name_entry = ttk.Entry(prop_frame)
        self.name_entry.pack(fill=tk.X, padx=5, pady=(0, 5))
        
        # Element selector
        ttk.Label(prop_frame, text="CSS Selector (optional):").pack(anchor=tk.W, padx=5, pady=(5, 0))
        self.selector_entry = ttk.Entry(prop_frame)
        self.selector_entry.pack(fill=tk.X, padx=5, pady=(0, 5))
        
        # Element text content
        ttk.Label(prop_frame, text="Text Content (optional):").pack(anchor=tk.W, padx=5, pady=(5, 0))
        self.text_entry = ttk.Entry(prop_frame)
        self.text_entry.pack(fill=tk.X, padx=5, pady=(0, 5))
        
        # Element tag/context
        ttk.Label(prop_frame, text="Context/Tag:").pack(anchor=tk.W, padx=5, pady=(5, 0))
        self.context_entry = ttk.Entry(prop_frame)
        self.context_entry.pack(fill=tk.X, padx=5, pady=(0, 5))
        self.context_entry.insert(0, self.context)
        
        # Buttons frame
        btn_frame = ttk.Frame(prop_frame)
        btn_frame.pack(fill=tk.X, padx=5, pady=5)
        
        # Update element button
        update_btn = ttk.Button(btn_frame, text="Update Element", command=self.update_element)
        update_btn.pack(side=tk.LEFT, padx=(0, 5))
        
        # Delete element button
        delete_btn = ttk.Button(btn_frame, text="Delete Element", command=self.delete_element)
        delete_btn.pack(side=tk.LEFT)
        
        # Status bar
        self.status_var = tk.StringVar()
        self.status_var.set("Ready")
        status_bar = ttk.Label(main_frame, textvariable=self.status_var, relief=tk.SUNKEN, anchor=tk.W)
        status_bar.pack(fill=tk.X, side=tk.BOTTOM, pady=(5, 0))
        
        # Load initial image if provided
        if screenshot_path:
            self.load_image(screenshot_path)
        
        # Start the main loop
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)
        self.root.mainloop()
        
    def browse_image(self):
        """Open file dialog to select a screenshot image"""
        file_path = filedialog.askopenfilename(
            title="Select Screenshot",
            filetypes=[("Image files", "*.png;*.jpg;*.jpeg"), ("All files", "*.*")]
        )
        if file_path:
            self.load_image(file_path)
            
    def load_image(self, path):
        """Load an image into the canvas"""
        try:
            self.image_path = path
            self.img = Image.open(path)
            self.photo = ImageTk.PhotoImage(self.img)
            
            # Update canvas
            self.canvas.delete("all")
            self.canvas.config(scrollregion=(0, 0, self.img.width, self.img.height))
            self.canvas.create_image(0, 0, anchor=tk.NW, image=self.photo)
            
            # Save screenshot data for pattern storage
            with open(path, "rb") as img_file:
                self.screenshot_data = base64.b64encode(img_file.read()).decode('utf-8')
                
            # Clear existing elements and markers
            self.elements = {}
            self.markers = {}
            self.refresh_element_list()
            
            self.status_var.set(f"Loaded screenshot: {os.path.basename(path)}")
            logger.info(f"Manual annotator loaded screenshot: {path}")
        except Exception as e:
            self.status_var.set(f"Error loading image: {str(e)}")
            logger.error(f"Error loading image in manual annotator: {str(e)}")
            
    def toggle_annotation(self):
        """Start or stop annotation mode"""
        self.annotation_active = not self.annotation_active
        if self.annotation_active:
            self.annotate_btn.configure(text="Stop Annotating")
            self.status_var.set("Annotation mode: Draw a box around a UI element")
        else:
            self.annotate_btn.configure(text="Start Annotating")
            self.status_var.set("Ready")
            
    def on_mouse_down(self, event):
        """Handle mouse press event for starting a selection"""
        if not self.annotation_active or not self.img:
            return
            
        # Convert canvas coordinates to image coordinates considering scrolling
        canvas_x = self.canvas.canvasx(event.x)
        canvas_y = self.canvas.canvasy(event.y)
        
        self.start_x = canvas_x
        self.start_y = canvas_y
        
        # Create a new rectangle
        self.rect_id = self.canvas.create_rectangle(
            self.start_x, self.start_y, self.start_x, self.start_y,
            outline="red", width=2, dash=(5, 5)
        )
        
    def on_mouse_drag(self, event):
        """Handle mouse drag event to update selection rectangle"""
        if not self.annotation_active or not self.img or not self.rect_id:
            return
            
        # Convert canvas coordinates considering scrolling
        canvas_x = self.canvas.canvasx(event.x)
        canvas_y = self.canvas.canvasy(event.y)
        
        # Update rectangle
        self.canvas.coords(self.rect_id, self.start_x, self.start_y, canvas_x, canvas_y)
        
    def on_mouse_up(self, event):
        """Handle mouse release event for completing a selection"""
        if not self.annotation_active or not self.img or not self.rect_id:
            return
            
        # Convert canvas coordinates considering scrolling
        canvas_x = self.canvas.canvasx(event.x)
        canvas_y = self.canvas.canvasy(event.y)
        
        # Get selection coordinates
        coords = self.canvas.coords(self.rect_id)
        
        # Check if selection is large enough
        if abs(coords[2] - coords[0]) < 10 or abs(coords[3] - coords[1]) < 10:
            # Too small, delete and return
            self.canvas.delete(self.rect_id)
            self.rect_id = None
            return
            
        # Normalize coordinates (ensure top-left to bottom-right)
        x1, y1, x2, y2 = coords
        x1, x2 = min(x1, x2), max(x1, x2)
        y1, y2 = min(y1, y2), max(y1, y2)
        
        # Create a new element with default name
        element_id = f"element_{int(time.time())}_{len(self.elements)}"
        
        # Create element data
        element_data = {
            "id": element_id,
            "name": element_id,
            "region": [int(x1), int(y1), int(x2-x1), int(y2-y1)],
            "selector": "",
            "text": "",
            "context": self.context,
            "url": self.current_url,
            "created_at": time.time()
        }
        
        # Add to elements dictionary
        self.elements[element_id] = element_data
        
        # Create a permanent rectangle with label
        marker_id = self.canvas.create_rectangle(
            x1, y1, x2, y2,
            outline="green", width=2, tags=("element", element_id)
        )
        label_id = self.canvas.create_text(
            x1+5, y1+5, 
            text=element_id, 
            anchor=tk.NW, 
            fill="green",
            tags=("label", element_id)
        )
        
        # Store marker reference
        self.markers[element_id] = {
            "rect": marker_id,
            "label": label_id
        }
        
        # Delete temporary rectangle
        self.canvas.delete(self.rect_id)
        self.rect_id = None
        
        # Update element list
        self.refresh_element_list()
        
        # Select the new element
        self.select_element(element_id)
        
        # Update status
        self.status_var.set(f"Element created: {element_id}")
        logger.info(f"Manual annotation: Created element {element_id}")
        
    def refresh_element_list(self):
        """Update the element listbox"""
        self.element_list.delete(0, tk.END)
        for element_id, data in self.elements.items():
            display_name = data.get("name", element_id)
            self.element_list.insert(tk.END, display_name)
            
    def on_element_select(self, event):
        """Handle element selection in listbox"""
        selection = self.element_list.curselection()
        if not selection:
            return
            
        # Get selected element
        index = selection[0]
        element_ids = list(self.elements.keys())
        if index < len(element_ids):
            element_id = element_ids[index]
            self.select_element(element_id)
            
    def select_element(self, element_id):
        """Select an element and populate its properties"""
        if element_id not in self.elements:
            return
            
        # Update current element
        self.current_element = element_id
        element = self.elements[element_id]
        
        # Update form fields
        self.name_entry.delete(0, tk.END)
        self.name_entry.insert(0, element.get("name", element_id))
        
        self.selector_entry.delete(0, tk.END)
        self.selector_entry.insert(0, element.get("selector", ""))
        
        self.text_entry.delete(0, tk.END)
        self.text_entry.insert(0, element.get("text", ""))
        
        self.context_entry.delete(0, tk.END)
        self.context_entry.insert(0, element.get("context", self.context))
        
        # Highlight the selected element
        for eid in self.markers:
            self.canvas.itemconfig(self.markers[eid]["rect"], width=2)
            self.canvas.itemconfig(self.markers[eid]["label"], fill="green")
            
        if element_id in self.markers:
            self.canvas.itemconfig(self.markers[element_id]["rect"], width=3)
            self.canvas.itemconfig(self.markers[element_id]["label"], fill="blue")
            
            # Ensure the element is visible
            region = element["region"]
            x1, y1 = region[0], region[1]
            self.canvas.see(x1, y1)
            
    def update_element(self):
        """Update selected element with form data"""
        if not self.current_element or self.current_element not in self.elements:
            return
            
        element = self.elements[self.current_element]
        
        # Update element data
        element["name"] = self.name_entry.get()
        element["selector"] = self.selector_entry.get()
        element["text"] = self.text_entry.get()
        element["context"] = self.context_entry.get()
        
        # Update marker label
        if self.current_element in self.markers:
            label_id = self.markers[self.current_element]["label"]
            self.canvas.itemconfig(label_id, text=element["name"])
            
        # Update element list
        self.refresh_element_list()
        
        self.status_var.set(f"Updated element: {element['name']}")
        logger.info(f"Manual annotation: Updated element {self.current_element}")
        
    def delete_element(self):
        """Delete the selected element"""
        if not self.current_element or self.current_element not in self.elements:
            return
            
        # Remove canvas markers
        if self.current_element in self.markers:
            for item_id in self.markers[self.current_element].values():
                self.canvas.delete(item_id)
            del self.markers[self.current_element]
            
        # Remove element data
        del self.elements[self.current_element]
        
        # Clear selection
        self.current_element = None
        
        # Update form fields
        self.name_entry.delete(0, tk.END)
        self.selector_entry.delete(0, tk.END)
        self.text_entry.delete(0, tk.END)
        
        # Update element list
        self.refresh_element_list()
        
        self.status_var.set("Element deleted")
        logger.info("Manual annotation: Deleted element")
        
    def update_url(self):
        """Update the current URL from the entry field"""
        self.current_url = self.url_entry.get()
        self.status_var.set(f"Updated URL: {self.current_url}")
        
    def save_all_elements(self):
        """Save all annotated elements to pattern storage"""
        if not self.elements:
            self.status_var.set("No elements to save")
            return
            
        try:
            # Load existing patterns
            patterns = self.storage.load_patterns()
            
            # Add/update each element
            for element_id, element in self.elements.items():
                name = element.get("name", element_id)
                context = element.get("context", "manual")
                
                # Sanitize name - replace spaces with underscores, remove special chars
                sanitized_name = re.sub(r'[^\w]', '_', name)
                
                # Create pattern key
                if element.get("selector"):
                    # If selector exists, use that as the key
                    pattern_key = f"{element['selector']}:{context}"
                else:
                    # Otherwise use the sanitized name
                    pattern_key = f"@{sanitized_name}:{context}"
                
                # Create pattern data
                pattern_data = {
                    "id": sanitized_name,
                    "name": name,
                    "selector": element.get("selector", ""),
                    "url": element.get("url", self.current_url),
                    "text": element.get("text", ""),
                    "location": element["region"],
                    "context": context,
                    "screenshot": self.screenshot_data if self.screenshot_data else "",
                    "learned_at": element.get("created_at", time.time()),
                    "last_seen": time.time(),
                    "times_seen": 1,
                    "manual": True
                }
                
                # Save to patterns
                patterns[pattern_key] = pattern_data
                
            # Save patterns to storage
            if self.storage.save_patterns(patterns):
                self.status_var.set(f"Saved {len(self.elements)} elements to pattern storage")
                logger.info(f"Manual annotation: Saved {len(self.elements)} elements to pattern storage")
            else:
                self.status_var.set("Error saving patterns")
                logger.error("Manual annotation: Error saving patterns")
                
        except Exception as e:
            self.status_var.set(f"Error saving elements: {str(e)}")
            logger.error(f"Manual annotation: Error saving elements: {str(e)}")
            
    def on_close(self):
        """Handle window close event"""
        # Ask to save if there are unsaved elements
        if self.elements and tk.messagebox.askyesno(
            "Save Elements",
            "Do you want to save the annotated elements before closing?",
            icon=tk.messagebox.QUESTION
        ):
            self.save_all_elements()
            
        # Destroy window
        self.root.destroy()
        self.root = None
        
    def load_command_image(self, screenshot_data):
        """Load image from base64 data"""
        try:
            # Convert base64 string to image
            img_data = base64.b64decode(screenshot_data)
            img = Image.open(io.BytesIO(img_data))
            
            # Save to temp file for loading
            temp_path = str(Path(os.path.expanduser("~")) / "EirosShell" / "temp" / f"screenshot_{int(time.time())}.png")
            os.makedirs(os.path.dirname(temp_path), exist_ok=True)
            img.save(temp_path)
            
            # Load the image
            self.load_image(temp_path)
            return True
        except Exception as e:
            logger.error(f"Error loading command image: {str(e)}")
            return False

# Global instance
manual_annotator = ManualAnnotator()

# Function to start annotator with last screenshot from memory
def start_with_last_screenshot():
    """Start the manual annotator with the last screenshot from memory"""
    from pattern_memory import pattern_memory
    
    # Get the patterns
    patterns = pattern_memory.patterns
    
    # Find the most recent screenshot
    latest_screenshot = None
    latest_time = 0
    latest_url = None
    
    for pattern_id, pattern in patterns.items():
        if "screenshot" in pattern and pattern.get("last_seen", 0) > latest_time:
            latest_screenshot = pattern["screenshot"]
            latest_time = pattern.get("last_seen", 0)
            latest_url = pattern.get("url", "unknown")
    
    if latest_screenshot:
        # Start annotator with the screenshot
        manual_annotator.start()
        manual_annotator.load_command_image(latest_screenshot)
        if latest_url:
            manual_annotator.current_url = latest_url
            manual_annotator.url_entry.delete(0, tk.END)
            manual_annotator.url_entry.insert(0, latest_url)
        return True
    else:
        # Start without screenshot
        manual_annotator.start()
        return False

if __name__ == "__main__":
    # For testing
    logging.basicConfig(level=logging.INFO)
    manual_annotator.start()
