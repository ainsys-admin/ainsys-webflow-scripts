<!-- Include this script in the Webflow page -->
<script>
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
    alert(data.alert);
  }
  // Handle 'restart_in_sec' key
  if (data.restart_in_sec) {
    const seconds = parseInt(data.restart_in_sec);
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
  // Make webhook request
  makeWebhookRequest();
  // Restore scroll position if page was reloaded
  restoreScrollPosition();
});
</script>
