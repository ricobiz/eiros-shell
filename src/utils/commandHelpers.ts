
import { CommandType } from "../types/types";

export function getCommandHelp(): Record<string, string> {
  return {
    [CommandType.CLICK]: "Click on an element or coordinates: { x, y, element, waitAfter }",
    [CommandType.TYPE]: "Type text into an element: { text, element, waitAfter }",
    [CommandType.NAVIGATION]: "Navigate to a URL: { url }",
    [CommandType.WAIT]: "Wait for specified duration: { duration }ms",
    [CommandType.SCREENSHOT]: "Take a screenshot of the current page",
    [CommandType.ANALYZE]: "Analyze the current page for elements",
    [CommandType.MEMORY_SAVE]: "Save data to memory: { type, data, tags }",
    [CommandType.MEMORY_RETRIEVE]: "Retrieve data from memory: { id, type, tags, limit }",
    [CommandType.LOGIN]: "Store credentials and login: { service, username, password, url, usernameSelector, passwordSelector, submitSelector }",
    [CommandType.AUTO_LOGIN]: "Auto login using saved credentials: { service }"
  };
}

export function getCommandExamples(): Record<string, string> {
  return {
    "Click": `/click#btn1{ "element": ".submit-button", "waitAfter": 500 }`,
    "Type": `/type#input1{ "text": "Hello world", "element": "#message-input" }`,
    "Navigate": `/navigate#go1{ "url": "https://example.com" }`,
    "Login": `/login#auth1{ "service": "chatgpt", "username": "user@example.com", "password": "password123", "url": "https://chat.openai.com/", "usernameSelector": "#username", "passwordSelector": "#password", "submitSelector": "#login-button" }`,
    "Auto-login": `/auto_login#quick1{ "service": "chatgpt" }`,
    "Wait": `/wait#pause1{ "duration": 2000 }`
  };
}
