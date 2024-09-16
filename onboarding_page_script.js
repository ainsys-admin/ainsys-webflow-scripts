<script>
// Utility function to safely get an element by ID
function getElementByIdSafe(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.error(`Element with ID "${id}" not found.`);
    return null;
  }
  return element;
}

// Function to validate and parse JSON string from CMS field
function validateAndParseJSON(jsonString, fieldName) {
  try {
    const data = JSON.parse(jsonString);
    return data;
  } catch (error) {
    // Display red alert notifying the user of invalid JSON
    displayNotification(`Invalid JSON in field "${fieldName}".`, 'error');
    // Report error to error reporting webhook
    reportError({
      message: `Invalid JSON in field "${fieldName}".`,
      field: fieldName,
      error: error.toString(),
    });
    return null;
  }
}

// Function to display notifications (non-blocking)
function displayNotification(message, type = 'info', duration = 5000) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`; // Add classes for styling
  notification.textContent = message;

  // Add notification to the page
  document.body.appendChild(notification);

  // Remove notification after specified duration
  setTimeout(() => {
    notification.remove();
  }, duration);
}

// Function to render content block on the page
function renderContent(blockData) {
  const blockId = blockData.block_id;
  const blockElement = getElementByIdSafe(blockId);
  if (!blockElement) {
    return;
  }

  // Clear existing content
  blockElement.innerHTML = '';

  // Create title element
  const titleElement = document.createElement(blockData.title_format || 'h2');
  titleElement.textContent = blockData.title || '';
  if (blockData.title_color) {
    titleElement.style.color = blockData.title_color;
  }
  blockElement.appendChild(titleElement);

  // Render content elements
  const contentArray = blockData.content || [];
  contentArray.forEach((contentItem) => {
    // Create content element based on content_format
    let contentElement;
    if (contentItem.content_format === 'chips') {
      contentElement = document.createElement('div');
      contentElement.className = 'chips-container';
      contentItem.content.forEach((chipText) => {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = chipText;
        contentElement.appendChild(chip);
      });
    } else if (
      contentItem.content_format === 'text' ||
      contentItem.content_format === 'markdown'
    ) {
      contentElement = document.createElement('div');
      contentElement.className = 'text-content';
      if (contentItem.content_format === 'markdown') {
        // For markdown, you can use a library like marked.js
        contentElement.innerHTML = marked(contentItem.content.join('\n'));
      } else {
        contentElement.textContent = contentItem.content.join(' ');
      }
    }

    if (contentElement) {
      blockElement.appendChild(contentElement);
    }
  });

  // Handle comments, actions, etc., if needed
  // For brevity, not implemented here
}

// Function to fetch and render all CMS data
function fetchAndRenderCMSData() {
  // List of CMS fields to process
  const cmsFields = [
    'company_name',
    'company_overview',
    'target_audience',
    'challenges_and_solutions',
    'core_value_proposition',
    'key_messages_and_tone',
    'prospect_org_validation',
    'outreach_persona_setup',
    'correspondence_tone_setup',
    'content_marketing_setup',
  ];

  cmsFields.forEach((fieldName) => {
    const elementId = fieldName; // Assuming element IDs match field names
    const element = getElementByIdSafe(elementId);
    if (!element) {
      return;
    }
    const jsonString = element.textContent.trim();
    if (!jsonString) {
      console.warn(`No data in field "${fieldName}".`);
      return;
    }
    const blockData = validateAndParseJSON(jsonString, fieldName);
    if (blockData) {
      renderContent(blockData);
    }
  });
}

// Function to make POST request to webhook
function makeWebhookRequest() {
  const url = window.location.href;
  const requestData = {
    url: url,
  };

  fetch('https://hook.eu2.make.com/84mjc5ftgekobn7nu5nki47jzyq2895f', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())
    .then((data) => {
      handleWebhookResponse(data);
    })
    .catch((error) => {
      console.error('Error calling webhook:', error);
      // Report error to error reporting webhook
      reportError({
        message: 'Error calling webhook',
        error: error.toString(),
      });
    });
}

// Function to handle webhook response
function handleWebhookResponse(data) {
  // Handle 'alert' key
  if (data.alert) {
    displayNotification(data.alert, 'alert');
  }
  // Handle 'check_in_sec' key
  if (data.check_in_sec) {
    const seconds = parseInt(data.check_in_sec);
    if (!isNaN(seconds) && seconds > 0) {
      saveScrollPosition();
      setTimeout(() => {
        window.location.reload();
      }, seconds * 1000);
    }
  }
  // Handle 'result' key
  if (data.result) {
    displayNotification(data.result, 'info', 5000);
  }
  // Handle block updates
  for (const key in data) {
    if (
      data.hasOwnProperty(key) &&
      !['alert', 'check_in_sec', 'result'].includes(key)
    ) {
      const blockJson = data[key];
      const blockData = validateAndParseJSON(blockJson, key);
      if (blockData) {
        renderContent(blockData);
      }
    }
  }
}

// Functions to save and restore scroll position
function saveScrollPosition() {
  sessionStorage.setItem('scrollPosition', window.scrollY);
}

function restoreScrollPosition() {
  const scrollPosition = sessionStorage.getItem('scrollPosition');
  if (scrollPosition !== null) {
    window.scrollTo(0, parseFloat(scrollPosition));
    sessionStorage.removeItem('scrollPosition');
  }
}

// Function to report errors to error reporting webhook
function reportError(errorData) {
  const requestData = {
    url: window.location.href,
    timestamp: new Date().toISOString(),
    error: errorData,
    user_agent: navigator.userAgent,
  };

  fetch('https://hook.eu2.make.com/9kgmq3nhsdmzqvfsrktprmznr9h9rrsr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  }).catch((error) => {
    console.error('Error reporting error:', error);
  });
}

// Event listener for page load
document.addEventListener('DOMContentLoaded', () => {
  // Fetch and render CMS data
  fetchAndRenderCMSData();
  // Make webhook request
  makeWebhookRequest();
  // Restore scroll position if page was reloaded
  restoreScrollPosition();
});
</script>
