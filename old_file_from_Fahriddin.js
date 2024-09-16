<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script>

function parseAndDisplayContent(inputElementId, outputElementId) {
  const inputElement = document.getElementById(inputElementId);
  const outputElement = document.getElementById(outputElementId);

  // Cheking element
  if (!inputElement || !outputElement) {
    console.error(
      `Ошибка: элементы с id ${inputElementId} или ${outputElementId} не найдены.`
    );
    return;
  }

  // Getting data from the inputElement element
  let data = inputElement.textContent.trim();

  if (!data) {
    outputElement.textContent = "No data";
    return;
  }

  // Regular expression for extraction
  const regex = /:\s*"(.*?)"/g;

  let match;
  const values = [];

  while ((match = regex.exec(data)) !== null) {
    values.push(match[1]);
  }

  // Displaying the values in the outputElement element
  outputElement.innerHTML = values.map((value) => `<p>${value}</p>`).join("");
}

function callFunc() {
  parseAndDisplayContent("brief_full", "brief_full-content");
  parseAndDisplayContent("brief_summary", "brief_summary-content");
  parseAndDisplayContent("company_industry", "company_industry-content");
  parseAndDisplayContent("company_summary", "company_summary-content");
  parseAndDisplayContent("company_overview", "company_overview-content");
  parseAndDisplayContent("contant_creation", "contant_creation-content");
  parseAndDisplayContent(
    "core-value-proposition",
    "core-value-proposition-content"
  );
  parseAndDisplayContent(
    "ideal-customer-profiles",
    "ideal-customer-profiles-content"
  );
  parseAndDisplayContent("target_audience", "target_audience-content");
  parseAndDisplayContent(
    "target_audience_companies_validation",
    "target_audience_companies_validation-content"
  );
  parseAndDisplayContent(
    "target_audience_people_validation",
    "target_audience_people_validation-content"
  );
  parseAndDisplayContent(
    "target_audience_correspondence_validation",
    "target_audience_correspondence_validation-content"
  );
  parseAndDisplayContent("company_industry", "company_industry-content");
  parseAndDisplayContent("company_overview", "company_overview-content");
}

// Call the web hook and output a response to the console
function callWebhook() {
  const url = window.location.href;
  const requestData = {
    url: url,
  };
  console.log(`URL`, url);

  fetch("https://hook.eu2.make.com/84mjc5ftgekobn7nu5nki47jzyq2895f", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json()) // We receive the response as JSON
    .then((data) => {
      console.log("Webhook response data:", data);
      console.log("here");

      // Checking and displaying popups based on response data
      if (
        data.result ===
        "No changes detected since last visit. Last visit time updated"
      ) {
        // Showing a pop-up window
        alert("No changes detected since last visit. Last visit time updated");
      } else if (
        data.result &&
        data.result.includes(
          "has activated project. Missing domain and other data: awaiting more input from user"
        )
      ) {
        // Showing a pop-up window with an email
        alert(data.result);
      }

      // Processing the data
      handleResponseData(data);

      // Calling the function to format and install the content
      callFunc();
    })
    .catch((error) => console.error("Error calling webhook:", error));
}

function handleResponseData(data) {
  if (data.check_in_sec && data.check_in_sec > 0) {
    //We repeat the request after the specified time
    setTimeout(callWebhook, data.check_in_sec * 1000);
  }
}

setTimeout(callWebhook, 9000);

// Calling a webhook when loading a page
document.addEventListener("DOMContentLoaded", () => {
  callWebhook();
  callFunc();
  // Calling the webhook when the page is reloaded
  window.addEventListener("beforeunload", () => {
    callWebhook();
    callFunc();
  });
});



</script>
