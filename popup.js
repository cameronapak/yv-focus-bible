/*
  Focus Bible Chrome Extension popup.js
  - The purpose of this application is to toggle the bible focus mode on Bible.com.

  Author: Cameron Pak
*/

// variables
var focusCheckboxStatus = document.getElementById("id-focus--1");
var isFocusEnabled = '';
var evt;
var bibleTag = [];

// updates focus status
function getFocusStatus() {
  chrome.storage.sync.get("bibleFocusEnabled", function(items) {
    isFocusEnabled = items.bibleFocusEnabled;
  });
}

function getBibleTabs() {
  chrome.tabs.query({url: "https://*.bible.com/*"}, function(tab) {
      bibleTag = tab;
      console.log(tab);
  });
}

/* runs on load */
window.onload = function() {

  // check Chrome storage and see the status on the focus mode
  chrome.storage.sync.get("bibleFocusEnabled", function(items) {

    // if Chrome doesn't explode
    if (!chrome.runtime.error) {

      // get the status of the stored attribute
      isFocusEnabled = items.bibleFocusEnabled;

      // make button reflect Chrome storage focus status
      if (isFocusEnabled == 'true') {
        focusCheckboxStatus.checked = true;
      } else if (isFocusEnabled == 'false') {
        focusCheckboxStatus.checked = false;
      }
    }
  });

  // get bible.com tabs for future refresh
  getBibleTabs();
};

/* runs on click */
window.addEventListener('click',function(e){

  // I don't know what this does
  if(e.target.href!==undefined){
    chrome.tabs.create({url:e.target.href})
  }

  // finds and sets focus checkbox status
  if (e.target.id == 'id-focus--1') {

    // if enabled and checked, then uncheck and disable
    if (isFocusEnabled == 'true') {
      focusCheckboxStatus.checked = false;
      chrome.storage.sync.set({'bibleFocusEnabled' : 'false'}, function() {
          console.log('Bible Focus Enabled: false');
      });

    // if disabled and unchecked, then check and enable
    } else if (isFocusEnabled == 'false') {
      focusCheckboxStatus.checked = true;
      chrome.storage.sync.set({'bibleFocusEnabled' : 'true'}, function() {
          console.log('Bible Focus Enabled: true');
      });
    }

    // update focus status
    getFocusStatus();

    // refresh page
    // if Bible.com tab is open
    if (bibleTag.length > 0) {
      chrome.tabs.reload(bibleTag[0].id);

    // if Bible.com tab isn't open
    } else {
      // bring attention to the Bible.com link
      setTimeout(function() {
        document.getElementById('bible-link').classList.add('jump');
      }, 2);
    }
  }
});

function newBibleTab() {
  console.log("Opening the word of God!");
}
