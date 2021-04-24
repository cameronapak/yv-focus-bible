/*
  Focus Bible Chrome Extension
  - The purpose of this application is to toggle the bible focus mode on Bible.com.

  Author: Cameron Pak
  
  * [X] Logged in focus mode.
  * [X] Figure out how to re-un on page change.
  * [X] Fix broken highlighting in focus mode.
  * [X] No longer have to include ext id in code.
  * [X] Go to the next verse by down click...
  * [ ] Can hide headers via toggle
  * [ ] Plan focus mode. ("https://*.bible.com/users/*reading-plans*segment/*")
*/

let isFocusEnabled // (bool)
let reader // used to get the reader html
let fileref // reference for injected css
let scriptureMode = true // we assume scripture is open
let planMode = false
let isLoggedIn = false

function checkLoginStatus() {
  const currentUrl = document.URL
  let loggedInUrl = 'my.bible.com'

  if (currentUrl.toLowerCase().includes(loggedInUrl)) {
    isLoggedIn = true
  }
}

// on every scroll, focus on the middle verse
function enableFocusOnScroll() {
  let isScrolling
  window.addEventListener('scroll', () => {
    // Clear our timeout throughout the scroll
    window.clearTimeout(isScrolling);

    // Set a timeout to run after scrolling ends
    isScrolling = setTimeout(function () {
      const elementsInMiddleOfScreen = document.elementsFromPoint(document.documentElement.clientHeight / 5, document.documentElement.clientWidth / 2)
      if (!elementsInMiddleOfScreen || !elementsInMiddleOfScreen.length) {
        return
      }

      const verseElement = elementsInMiddleOfScreen.find((elem) => elem.classList.contains('verse'))
      const headingElement = elementsInMiddleOfScreen.find((elem) => elem.classList.contains('s1'))

      // Remove existing focus classes
      const focusClassList = ['focus', 'visible']
      for (className of focusClassList) {
        document.querySelectorAll(`.${className}`).forEach((elem) => {
          elem.classList.toggle(className)
        })
      }

      // Apply classes to emphasize content
      if (verseElement) {
        verseElement.classList.toggle('focus')
      } else if (headingElement && headingElement.children.length) {
        headingElement.children[0].classList.toggle('visible')
      }
    }, 250);
  }, false)
}

/** Injects the necessary CSS to enable focus mode */
function injectFocusCSS() {
  const cssUrl = chrome.runtime.getURL('/src/inject/inject.css')

  // inject focus bible CSS
  fileref = document.createElement("link")
  fileref.setAttribute("rel", "stylesheet")
  fileref.setAttribute("type", "text/css")
  fileref.setAttribute('href', cssUrl)

  document.getElementsByTagName("head")[0].appendChild(fileref)
}

const prepareHeartHtml = `
    <div style="margin: 15vh 0;">
      <div class="circle">
      </div>
      <div class="start-ch"> 
        Breathe and relax as you begin to spend time with God. 
      </div>
      <div id="read-prompt" class="ready"> 
        Scroll, or use arrow keys, when ready. 
      </div>
    </div>`

function toggleFocusReader() {
  injectFocusCSS()
  reader.insertAdjacentHTML('afterbegin', prepareHeartHtml)
  enableFocusOnScroll()
}

/* paves the way for focus mode to be enabled */
function prepFocusMode() {
  // grab the Bible reader
  try {
    if (!isLoggedIn) {
      reader = document.getElementsByClassName('yv-bible-text')[0]
    } else {
      reader = document.getElementsByClassName('bible-reader')[0]
      // // maybe it's a bible plan
      if (reader === undefined) {
        // just try to see if its a bible plan
        reader = document.getElementsByClassName('devo-content')[0]
        if (reader !== undefined) {
          planMode = true
        }
      }
    }
  } catch (error) {
    console.error(error)
  }

  if (scriptureMode || planMode) {
    // grab the focus status
    chrome.storage.sync.get("bibleFocusEnabled", function (items) {
      // if focus toggle storage var doesn't exist
      if (items.bibleFocusEnabled === undefined) {
        chrome.storage.sync.set({
          'bibleFocusEnabled': true
        }, function () {
          // Can do whatever we want here...
        })

        // refresh page to start focus reader
        window.location.reload()
      } else {
        // set focus status
        isFocusEnabled = items.bibleFocusEnabled

        // start the focus reader
        if (isFocusEnabled) {
          toggleFocusReader(isFocusEnabled)
        }
      }
    })
  }
}

chrome.extension.sendMessage({}, function (response) {
  var readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
      window.clearInterval(readyStateCheckInterval)
      checkLoginStatus()
      prepFocusMode()
    } /* Document ready */
  }, 10)
})