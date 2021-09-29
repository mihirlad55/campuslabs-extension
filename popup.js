document.addEventListener('DOMContentLoaded', function() {
  // Inject inject.js into tab
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.executeScript(tabs[0].id, {
      file: 'inject.js'
    });
  });

  // Add event listener for add dates button
  let btnAddDates = document.getElementById('btnAddDates');
  btnAddDates.addEventListener('click', addDates);
});

function sendAction(action, args) {
  // Send message to injected script
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: action, args: args }, function (response) {});
  });
}

function normalizeDateInputValue(datetime) {
  // Split date
  let tokens = datetime.split('-');

  // Extract year, month, and date
  let year = tokens[0];
  let month = tokens[1];
  let date = tokens[2];

  // Re-format date
  let dateStr = month + "-" + date + "-" + year;

  return dateStr;
}

function addDates() {
  // Get end date input
  let inputEndDate = document.getElementById('inputEndDate');
  // Normalize date
  endDate = normalizeDateInputValue(inputEndDate.value);

  // Send action to injected script
  sendAction('addDates', endDate);
}
