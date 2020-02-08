/*
  Focus Bible Chrome Extension
  - The purpose of this application is to toggle the bible focus mode on Bible.com.

  Author: Cameron Pak
  
  * [X] Logged in focus mode.
  * [ ] Figure out how to re-run on page change.
	* [ ] Plan focus mode.
	* [X] Fix broken highlighting in focus mode.

	Update: I turned off the logged in mode and plans for right now.
*/

// variables
let isFocusEnabled
var verses // used to get a query of all verses
var getElementsInArea // used to get verse in middle of screen.
var reader // used to get the reader html
var fileref // reference for injected css
var ticking = false // for scrolling
var scriptureMode = true // we assume scripture is open
var planMode = false // if in a plan, then display plan focus
var commentaryLink = '' // testing commentary link

let isLoggedIn = false
const checkLoginStatus = () => {
  const currentUrl = document.URL
  let loggedInUrl = 'my.bible.com'

  if (currentUrl.toLowerCase().includes(loggedInUrl)) {
    isLoggedIn = true
  }
}

// makes the verse in the middle of the screen focused
function scrollCheck(e) {
  if (!isLoggedIn) {
    // make verses visible in the middle of screen
    getElementsInArea(e, {
      elements: document.querySelectorAll('.yv-bible-text .book .verse'),
      markedClass: 'focus',
      zone: [46, 46] // percentage distance from top & bottom
    })

    // make headings visible in middle of screen
    getElementsInArea(e, {
      elements: document.querySelectorAll('.yv-bible-text .book .heading'),
      markedClass: 'visible',
      zone: [46, 46] // percentage distance from top & bottom
    })

    getElementsInArea(e, {
      elements: document.querySelectorAll('.yv-bible-text .book .d'),
      markedClass: 'visible',
      zone: [46, 46] // percentage distance from top & bottom
    })
  }

  /* When user is logged in, code changes a little */
  if (isLoggedIn) {
    console.log('I am logged in. Use different code for reader.')
    getElementsInArea(e, {
      elements: document.querySelectorAll('.bible-reader .book .verse'),
      markedClass: 'focus',
      zone: [46, 46] // percentage distance from top & bottom
    })

    // make headings visible in middle of screen
    getElementsInArea(e, {
      elements: document.querySelectorAll('.bible-reader .book .heading'),
      markedClass: 'visible',
      zone: [46, 46] // percentage distance from top & bottom
    })

    getElementsInArea(e, {
      elements: document.querySelectorAll('.bible-reader .book .d'),
      markedClass: 'visible',
      zone: [46, 46] // percentage distance from top & bottom
    })
  }

  if (planMode) {
    getElementsInArea(e, {
      elements: document.querySelectorAll('.devo-content .devotional')[0].children,
      markedClass: 'visible',
      zone: [46, 46] // percentage distance from top & bottom
    })
  }

  getElementsInArea(e, {
    elements: document.querySelectorAll('.body .lh-copy'),
    markedClass: 'visible',
    zone: [46, 46] // percentage distance from top & bottom
  })
}

// on every scroll, focus on the middle verse
function enableFocusOnScroll() {
  // Reference: http://www.html5rocks.com/en/tutorials/speed/animations/
  window.addEventListener('scroll', function (e) {

    if (!ticking) {
      window.requestAnimationFrame(function () {
        scrollCheck(event)
        ticking = false
      })

      ticking = true
    }
  })
}

// toggle the focus reader on and off
function toggleFocusReader() {
  console.log("Focus Bible: focus enabled.")

  // remove the header and Footer
  removeHeaderAndFooter()

  // inject focus bible CSS
  fileref = document.createElement("link")
  fileref.setAttribute("rel", "stylesheet")
  fileref.setAttribute("type", "text/css")
  fileref.setAttribute("href", "chrome-extension://ioflbgigemihmblihppmhdnaefdaligj/src/inject/inject.css")

  // fileref.setAttribute("href", "chrome-extension://jbjgbfheajcenmdgohnodpnigokdpdik/src/inject/inject.css")
  document.getElementsByTagName("head")[0].appendChild(fileref)

  // add breathing circle and animated text
  // TODO - uncomment later. This is disabled
  if (false && commentaryLink) {
    reader.innerHTML = '<a id="commentary-link" href=""" target="_blank" style="text-decoration: none"><h4 class="mb5 tc f6 normal pa3 ba b--black-20 br2 outline-0 mid-gray bg-white ma0" style="padding: 16px">Bible Commentary</h4></a><div style="margin-bottom:15vh"><div class="circle"></div><div class="start-ch"> Breathe and relax as you begin to spend time with God. </div><div id="read-prompt" class="ready"> Scroll when ready. </div></div>' + reader.innerHTML
    // add commentary link
    document.getElementById('commentary-link').setAttribute('href', commentaryLink)
  }

  reader.innerHTML = '<div style="margin: 15vh 0;"><div class="circle"></div><div class="start-ch"> Breathe and relax as you begin to spend time with God. </div><div id="read-prompt" class="ready"> Scroll when ready. </div></div>' + reader.innerHTML

  // set read prompt
  // document.getElementById('read-prompt').innerText = "HEY!!"

  // grabs all elemens in the area
  getElementsInArea = (function (docElm) {
    var viewportHeight = docElm.clientHeight

    return function (e, opts) {
      var found = [],
        i

      if (e && e.type == 'resize')
        viewportHeight = docElm.clientHeight

      for (i = opts.elements.length; i--;) {
        var elm = opts.elements[i],
          pos = elm.getBoundingClientRect(),
          topPerc = pos.top / viewportHeight * 100,
          bottomPerc = pos.bottom / viewportHeight * 100,
          middle = (topPerc + bottomPerc) / 2,
          inViewport = middle > opts.zone[1] &&
            middle < (100 - opts.zone[1])

        elm.classList.toggle(opts.markedClass, inViewport)

        if (inViewport)
          found.push(elm)
      }
    }
  })(document.documentElement)

  enableFocusOnScroll()
} /* on reading viewer */

/* gets commentary for each book */
function getCommentaryLink() {
  // testing out commentaryLink
  var z = document.getElementsByTagName('title')[0].innerText.toLowerCase()

  // fix for Psalm and Song of Solomon
  if (z.includes('song')) {
    z = z.split(' ').slice(0, 4).join('-')

    if (z.includes('songs')) {
      z = z.replace('songs', 'solomon')
    }
  } else if (z.includes('psalms')) {
    z = z.replace('psalms', 'psalm')
  }

  if (z.includes('acts')) {
    var chapterNum = z.match(/\d+/g)
    z = "acts " + chapterNum.toString()
  }

  // if there is a number at the beginning, then do things a little diff.
  if (isNaN(z.charAt(0))) {
    // only do two strings for 'Romans-8'
    z = z.split(' ').slice(0, 2).join('-')
  } else {
    // do three strings for '1-Corinthians-13'
    z = z.split(' ').slice(0, 3).join('-')
  }

  // remove trailing comma!
  if (z.includes(',')) {
    z = z.replace(',', '')
  }

  commentaryLink = "https://enduringword.com/bible-commentary/" + z + "/"
  console.log("Focus Bible: bible commentary -\n" + commentaryLink)
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
      console.log('did I get any items? If so, then I must be good.', items)
      // if focus toggle storage var doesn't exist
      if (items.bibleFocusEnabled === undefined) {
        chrome.storage.sync.set({
          'bibleFocusEnabled': true
        }, function () {
          console.log('Bible Focus Enabled: true')
        })

        // refresh page to start focus reader
        window.location.reload()
      } else {
        // set focus status
        isFocusEnabled = items.bibleFocusEnabled

        // start the focus reader
        if (isFocusEnabled) {
          toggleFocusReader(isFocusEnabled)
          console.log("Focus Bible: enabled.")
        } else {
          console.log("Focus Bible: focus disabled.")
        }
      }
    })
  }
}

/* removes header and footer */
function removeHeaderAndFooter() {
  if (!isLoggedIn) {
    // header is removed in CSS

    // remove footer (hacky way to do it)
    var footer = document.getElementsByClassName('fixed-l left-0-l w-100-l bottom-0-l bg-white b--black-20 bt-l z-999')[0]
    footer.remove()
  }
}

/* runs on load */
chrome.extension.sendMessage({}, function (response) {
  var readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval)
      checkLoginStatus()
      prepFocusMode()
    } /* Document ready */
  }, 10)
})
