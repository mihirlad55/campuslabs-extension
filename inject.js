var respondents = null;

(function() {
  console.log("Running inject.js");

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      console.log("Received message:");
      console.log(request);

      // Perform requested action
    if (request.action === "addDates") {
      createDatesUntilEndDate(request.args)
      updateDates();
    }
  });
})();

function setTimeZero(date) {
  // Zero out all non-date numbers
  // Useful for date-only comparisons
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
}

function createDatesUntilEndDate(endDate) {
  // Get start date inputs
  let elements = document.getElementsByClassName('instance-start-date-input');
  // Filter out non-inputs. Some HTML elements have the same class name but
  // are not input elements
  let dateStartInputs = filterHTMLElementsByNodeName(elements, 'input');

  // Get first date input
  let firstInput = dateStartInputs[0];

  // Parse first and last date of recurrences
  let firstDate = new Date(Date.parse(firstInput.value));
  let lastDate = new Date(Date.parse(endDate));

  // Zero out time
  firstDate = setTimeZero(firstDate);
  lastDate = setTimeZero(lastDate);

  // Calculate number of recurrences
  let numOfRecurrences = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 7);

  // Subtract already existing dates
  numOfRecurrences -= (dateStartInputs.length - 1);

  // Add missing dates
  createDates(numOfRecurrences);
}

function createDates(numOfDates) {
  // Get add button
  let btnAdd = document.getElementById('instance-add-button');

  // Click add button in a loop
  for (let i = 0; i < numOfDates; i++) {
    btnAdd.click()
  }
}

function formatDate(dateObj) {
  // Short month names
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Get date, month, and year
  let date = dateObj.getDate().toString();
  let month = dateObj.getMonth().toString();
  let year = dateObj.getFullYear().toString();

  // Return date in this format
  return date + ' ' + MONTHS[month] + ' ' + year;
}

function getNextWeekDate(dateObj) {
  // Get date one week from this date
  dateObj.setDate(dateObj.getDate() + 7);
  return dateObj;
}

function filterHTMLElementsByNodeName(elements, name) {
  filteredElements = [];

  // Only keep elements that have the given node name
  for (el of elements) {
    if (el.nodeName.toLowerCase() === name.toLowerCase())
      filteredElements.push(el);
  }

  return filteredElements;
}

function setDateInputsRecurring(dateInputs) {
  // Get first input
  let firstInput = dateInputs[0];
  // Get date one week from the date set in the first input
  let nextDate = getNextWeekDate(new Date(Date.parse(firstInput.value)));

  // Iterate through all date inputs
  for (input of dateInputs) {
    // Skip first date input
    if (input === firstInput)
      continue;

    // Format the date for the datepicke input
    input.value = formatDate(nextDate);

    // Calculate date next week
    nextDate = getNextWeekDate(nextDate);
  }
}

function updateDates() {
  // Get all start date inputs
  let elements = document.getElementsByClassName('instance-start-date-input');
  // Filter out non-input elements
  let dateStartInputs = filterHTMLElementsByNodeName(elements, 'input');

  // Get all end date inputs
  elements = document.getElementsByClassName('instance-end-date-input');
  // Filter out non-input elements
  let dateEndInputs = filterHTMLElementsByNodeName(elements, 'input');

  // Set the array of start inputs as a series of recurrences
  setDateInputsRecurring(dateStartInputs);
  // Set the array of end inputs as a series of recurrences
  setDateInputsRecurring(dateEndInputs);
}

function updateLocations(locationName) {
  // Get location controls
  let locationButtons = document.getElementsByClassName('instance-location-button');
  let locationNoMapButtons = document.getElementsByClassName('btn_Location btn-hide-map');
  let locationTextboxes = document.getElementsByClassName('instance-locationName');
  let locationSaveButtons = document.getElementsByClassName('locationModel-closebutton');

  // Set location for each event
  for (let i = 0; i < locationButtons.length; i++) {
    locationTextboxes[i].value = locationName;
    locationButtons[i].click();
    locationNoMapButtons[i].click();
    locationSaveButtons[i].click();
  }
}

function injectScript(script) {
  console.log("Injecting script: \n" + script);

  // Create script element
  let scriptElement = document.createElement('script');

  // Create random ID
  scriptElement.id = "tmpScript_" + Math.random().toString(36).substr(2, 5);

  // Append script content as text
  scriptElement.appendChild(document.createTextNode(script));

  // Append script element to document
  (document.body || document.head || document.documentElement).appendChild(scriptElement);

  // Remove script element
  (document.body || document.head || document.documentElement).removeChild(scriptElement);
}

function getWindowVariable(variable) {
  // Stringify variable and set as attribute of document body
  let scriptContent = "if (typeof " + variable + " !== 'undefined') " +
      "document.body.setAttribute('tmp_" + variable + "', JSON.stringify(" + variable + "));";

  // Inject and run script
  injectScript(scriptContent);

  // Extract variable value from attribute
  variableValue = JSON.parse(document.body.getAttribute("tmp_" + variable));

  // Remove temporary attribute
  document.body.removeAttribute("tmp_" + variable);

  return variableValue;
}
