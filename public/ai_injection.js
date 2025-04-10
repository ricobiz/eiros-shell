
// ChatGPT window communication script
console.log("EirosShell: Injection script loaded into ChatGPT window");

// Set up message listener to receive messages from shell
window.addEventListener('message', function(event) {
  console.log("EirosShell: Message received in ChatGPT window", event.data);
  
  // Check if this is a message from our shell
  if (event.data && (event.data.type === 'EIROS_SHELL_MESSAGE' || event.data.type === 'EIROS_INIT')) {
    console.log("EirosShell: Processing shell message:", event.data);
    
    // Send confirmation back to parent window
    window.parent.postMessage({
      type: 'EIROS_RESPONSE',
      content: 'Message received in ChatGPT window: ' + (event.data.message || 'No message content'),
      status: 'received'
    }, '*');
    
    // Process the message
    if (event.data.type === 'EIROS_SHELL_MESSAGE') {
      // Find the ChatGPT input field
      const inputField = document.querySelector('textarea[placeholder], .input-area textarea');
      
      if (inputField) {
        console.log("EirosShell: Found input field, setting value:", event.data.message);
        
        // Set the text in the input field
        inputField.value = event.data.message;
        
        // Create and dispatch input event to trigger ChatGPT's listeners
        const inputEvent = new Event('input', { bubbles: true });
        inputField.dispatchEvent(inputEvent);
        
        // Find the send button and click it
        setTimeout(() => {
          const sendButton = document.querySelector('button[aria-label="Send message"], .send-button');
          if (sendButton) {
            console.log("EirosShell: Found send button, clicking it");
            sendButton.click();
            console.log("EirosShell: Message sent to ChatGPT");
            
            // Listen for the response
            startResponseMonitoring();
          } else {
            console.error("EirosShell: Send button not found");
            window.parent.postMessage({
              type: 'EIROS_RESPONSE',
              content: 'Error: Send button not found in ChatGPT interface',
              status: 'error'
            }, '*');
          }
        }, 100);
      } else {
        console.error("EirosShell: Input field not found");
        window.parent.postMessage({
          type: 'EIROS_RESPONSE',
          content: 'Error: Input field not found in ChatGPT interface',
          status: 'error'
        }, '*');
      }
    } else if (event.data.type === 'EIROS_INIT') {
      console.log("EirosShell: Initialization message received");
      // Send confirmation back to parent
      window.parent.postMessage({
        type: 'EIROS_RESPONSE',
        content: 'Connection established with ChatGPT window',
        status: 'connected'
      }, '*');
      
      // Send environment information for debugging
      window.parent.postMessage({
        type: 'EIROS_RESPONSE',
        content: 'Environment info: ' + 
                 'URL=' + window.location.href + ', ' + 
                 'hasTextarea=' + (!!document.querySelector('textarea') ? 'yes' : 'no'),
        status: 'info'
      }, '*');
    }
  }
});

// Function to monitor for ChatGPT responses
function startResponseMonitoring() {
  console.log("EirosShell: Starting response monitoring");
  
  // Track current message count
  let lastMessageCount = document.querySelectorAll('.message, .chat-message, .prose, .markdown').length;
  console.log("EirosShell: Initial message count:", lastMessageCount);
  
  // Set up an interval to check for new messages
  const checkInterval = setInterval(() => {
    const currentMessages = document.querySelectorAll('.message, .chat-message, .prose, .markdown');
    console.log("EirosShell: Current message count:", currentMessages.length);
    
    // If we have more messages than before, the newest one is likely ChatGPT's response
    if (currentMessages.length > lastMessageCount) {
      console.log("EirosShell: New message detected");
      
      // Check if the response is still being generated (typing animation)
      const isGenerating = document.querySelector('.loading, .typing-indicator, .result-streaming');
      
      if (!isGenerating) {
        // Get the last message (ChatGPT's response)
        const latestMessage = currentMessages[currentMessages.length - 1];
        
        if (latestMessage) {
          const responseText = latestMessage.innerText || latestMessage.textContent;
          console.log("EirosShell: Response from ChatGPT:", responseText);
          
          // Send the response back to the shell
          window.parent.postMessage({
            type: 'CHATGPT_RESPONSE',
            message: responseText
          }, '*');
          
          // Clear the interval as we've captured the response
          clearInterval(checkInterval);
          console.log("EirosShell: Response monitoring completed");
        }
      }
      
      // Update the message count
      lastMessageCount = currentMessages.length;
    }
  }, 1000);
  
  // Safety timeout to prevent eternal monitoring
  setTimeout(() => {
    clearInterval(checkInterval);
    console.log("EirosShell: Response monitoring timed out");
  }, 60000); // 1 minute timeout
}

// Send ready message to parent window
window.parent.postMessage({
  type: 'EIROS_RESPONSE',
  content: 'ChatGPT injection script loaded successfully',
  status: 'ready'
}, '*');

console.log("EirosShell: Setup complete, ready to receive messages");

// Set up a heartbeat to periodically check if the connection is still active
setInterval(() => {
  try {
    window.parent.postMessage({
      type: 'EIROS_RESPONSE',
      content: 'ChatGPT heartbeat',
      status: 'heartbeat'
    }, '*');
  } catch (e) {
    console.error("EirosShell: Heartbeat error:", e);
  }
}, 10000); // Every 10 seconds
