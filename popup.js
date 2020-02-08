/*
  Focus Bible Chrome Extension popup.js
  - The purpose of this application is to toggle the bible focus mode on Bible.com.

  Author: Cameron Pak
*/

// variables
var focusCheckboxStatus = document.getElementById("id-focus--1");
let isFocusEnabled = false
var evt;
var bibleTag = [];

function getBibleTabs() {
  chrome.tabs.query({ url: "https://*.bible.com/*" }, function (tab) {
    bibleTag = tab;
    console.log(tab);
  });
}

/* runs on load */
window.onload = function () {
  // check Chrome storage and see the status on the focus mode
  chrome.storage.sync.get("bibleFocusEnabled", function (items) {

    // if Chrome doesn't explode
    if (!chrome.runtime.error) {

      // get the status of the stored attribute
      isFocusEnabled = items.bibleFocusEnabled;

      const sliderElement = document.getElementById('id-focus--1')

      // make button reflect Chrome storage focus status
      if (isFocusEnabled) {
        sliderElement.checked = true
      } else {
        sliderElement.checked = false
      }
    }
  });

  // get bible.com tabs for future refresh
  getBibleTabs();

  setUpSliderEventListener();
};

const setUpSliderEventListener = () => {
  const sliderElement = document.getElementById('id-focus--1')

  sliderElement.addEventListener('change', (e) => {
    // if enabled and checked, then uncheck and disable
    if (isFocusEnabled) {
      this.checked = false;
      chrome.storage.sync.set({ 'bibleFocusEnabled': false }, function () {
        console.log('Bible Focus Enabled: false');
      });

      // if disabled and unchecked, then check and enable
    } else {
      this.checked = true;
      chrome.storage.sync.set({ 'bibleFocusEnabled': true }, function () {
        console.log('Bible Focus Enabled: true');
      });
    }

    // flips the switch
    isFocusEnabled = !isFocusEnabled

    // refresh page
    // if Bible.com tab is open
    if (bibleTag.length > 0) {
      chrome.tabs.reload(bibleTag[0].id);
    } else { // if Bible.com tab isn't open
      // bring attention to the Bible.com link
      setTimeout(function () {
        document.getElementById('bible-link').classList.add('jump');
      }, 2);
    }
  })
}
