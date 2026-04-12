let devModeEnabled = false;

chrome.action.onClicked.addListener(async (tab) => {
  devModeEnabled = !devModeEnabled;
  
  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: devModeEnabled ? 'TOGGLE_ON' : 'TOGGLE_OFF'
    });
  } catch (error) {
    console.error('Failed to send message:', error);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-dev-mode') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      devModeEnabled = !devModeEnabled;
      
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: devModeEnabled ? 'TOGGLE_ON' : 'TOGGLE_OFF'
        });
      } catch (error) {
        console.error('Failed to send command:', error);
      }
    }
  }
});