Project Overview
Goal: Create an onboarding feature on your Webflow website where a personalized page is generated for a potential customer, displaying data about their company. This page fetches data from the CMS, displays it, makes a webhook call, and handles the response to update the page dynamically.

Organizing the Project
Since you'll be copying and pasting the code into the Webflow Designer UI, we'll create a self-contained script that can be embedded directly into your CMS collection page template. 

This script will:
Fetch and validate CMS data.
Render content blocks based on the data.
Make a webhook call after the page loads.
Handle the webhook response to update the page.
Report any errors to the specified error reporting URL.
We'll structure the code into modular functions for clarity and maintainability.
