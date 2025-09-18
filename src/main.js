/**
 * Copyright (c) 2020 Google Inc
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const exposed = {};
if (location.search) {
  var a = document.createElement("a");
  a.href = location.href;
  a.search = "";
  history.replaceState(null, null, a.href);
}

function tweet_(url) {
  open(
    "https://twitter.com/intent/tweet?url=" + encodeURIComponent(url),
    "_blank"
  );
}
function tweet(anchor) {
  tweet_(anchor.getAttribute("href"));
}
expose("tweet", tweet);

function share(anchor) {
  var url = anchor.getAttribute("href");
  event.preventDefault();
  if (navigator.share) {
    navigator.share({
      url: url,
    });
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
    message("Article URL copied to clipboard.");
  } else {
    tweet_(url);
  }
}
expose("share", share);

// Calculator functionality
function initCalculator() {
  // Create calculator UI if it doesn't exist
  if (!document.getElementById("calculator-widget")) {
    const calculatorHTML = `
      <div id="calculator-widget" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border: 2px solid #ccc; border-radius: 8px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; font-family: Arial, sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0; color: #333;">Calculator</h3>
          <button id="calculator-close" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #666;">&times;</button>
        </div>
        <div style="margin-bottom: 15px;">
          <input type="number" id="calc-a" placeholder="First number" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <select id="calc-operation" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="add">Add (+)</option>
            <option value="subtract">Subtract (-)</option>
            <option value="multiply">Multiply (×)</option>
            <option value="divide">Divide (÷)</option>
            <option value="power">Power (^)</option>
            <option value="sqrt">Square Root (√)</option>
          </select>
          <input type="number" id="calc-b" placeholder="Second number" style="width: 100%; padding: 8px; margin-bottom: 12px; border: 1px solid #ddd; border-radius: 4px;">
          <button id="calc-execute" style="width: 100%; padding: 10px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Calculate</button>
        </div>
        <div id="calc-result" style="padding: 10px; background: #f5f5f5; border-radius: 4px; min-height: 20px; color: #333;"></div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', calculatorHTML);
    
    // Add event listeners
    document.getElementById("calculator-close").addEventListener("click", hideCalculator);
    document.getElementById("calc-execute").addEventListener("click", performCalculation);
    document.getElementById("calc-operation").addEventListener("change", toggleSecondInput);
    
    // Handle Enter key in inputs
    document.getElementById("calc-a").addEventListener("keypress", function(e) {
      if (e.key === "Enter") performCalculation();
    });
    document.getElementById("calc-b").addEventListener("keypress", function(e) {
      if (e.key === "Enter") performCalculation();
    });
    
    toggleSecondInput(); // Initialize visibility of second input
  }
}

function toggleSecondInput() {
  const operation = document.getElementById("calc-operation").value;
  const secondInput = document.getElementById("calc-b");
  if (operation === "sqrt") {
    secondInput.style.display = "none";
    secondInput.required = false;
  } else {
    secondInput.style.display = "block";
    secondInput.required = true;
  }
}

function showCalculator() {
  initCalculator();
  document.getElementById("calculator-widget").style.display = "block";
}

function hideCalculator() {
  const widget = document.getElementById("calculator-widget");
  if (widget) {
    widget.style.display = "none";
  }
}

async function performCalculation() {
  const a = document.getElementById("calc-a").value;
  const operation = document.getElementById("calc-operation").value;
  const b = document.getElementById("calc-b").value;
  const resultDiv = document.getElementById("calc-result");
  
  if (!a || (operation !== "sqrt" && !b)) {
    resultDiv.innerHTML = '<span style="color: red;">Please fill in all required fields.</span>';
    return;
  }
  
  try {
    resultDiv.innerHTML = '<span style="color: #666;">Calculating...</span>';
    
    // Try API first, then fallback to client-side calculation
    const params = new URLSearchParams({
      operation: operation,
      a: a
    });
    
    if (operation !== "sqrt") {
      params.append('b', b);
    }
    
    let result;
    try {
      const response = await fetch(`/api/calculator?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        result = data.result;
      } else {
        throw new Error('API not available');
      }
    } catch (apiError) {
      // Fallback to client-side calculation
      result = performClientSideCalculation(parseFloat(a), operation, b ? parseFloat(b) : null);
    }
    
    const formattedResult = typeof result === 'number' ? 
      (result % 1 === 0 ? result.toString() : result.toFixed(6).replace(/\.?0+$/, '')) :
      result;
    resultDiv.innerHTML = `<strong>Result: ${formattedResult}</strong>`;
    
  } catch (error) {
    resultDiv.innerHTML = `<span style="color: red;">Error: ${error.message}</span>`;
    console.error('Calculator error:', error);
  }
}

function performClientSideCalculation(numA, operation, numB) {
  if (isNaN(numA)) {
    throw new Error("Invalid number for first input");
  }
  
  switch (operation.toLowerCase()) {
    case 'add':
    case '+':
      if (isNaN(numB)) throw new Error("Invalid number for second input");
      return numA + numB;
      
    case 'subtract':
    case '-':
      if (isNaN(numB)) throw new Error("Invalid number for second input");
      return numA - numB;
      
    case 'multiply':
    case '*':
      if (isNaN(numB)) throw new Error("Invalid number for second input");
      return numA * numB;
      
    case 'divide':
    case '/':
      if (isNaN(numB)) throw new Error("Invalid number for second input");
      if (numB === 0) throw new Error("Division by zero is not allowed");
      return numA / numB;
      
    case 'sqrt':
      if (numA < 0) throw new Error("Cannot calculate square root of negative number");
      return Math.sqrt(numA);
      
    case 'power':
    case '^':
      if (isNaN(numB)) throw new Error("Invalid number for second input");
      return Math.pow(numA, numB);

    default:
      throw new Error("Unknown operation. Supported: add, subtract, multiply, divide, sqrt, power");
  }
}

function calculator() {
  showCalculator();
}
expose("calculator", calculator);

// Google Analytics GUI functionality
function initAnalyticsGUI() {
  if (!document.getElementById("analytics-widget")) {
    const analyticsHTML = `
      <div id="analytics-widget" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border: 2px solid #ccc; border-radius: 8px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; font-family: Arial, sans-serif; min-width: 300px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0; color: #333;">Analytics Event Tracker</h3>
          <button id="analytics-close" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #666;">&times;</button>
        </div>
        <div style="margin-bottom: 15px;">
          <select id="analytics-type" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="event">Event</option>
            <option value="pageview">Page View</option>
          </select>
          <input type="text" id="analytics-category" placeholder="Event Category" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <input type="text" id="analytics-action" placeholder="Event Action" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <input type="text" id="analytics-label" placeholder="Event Label (optional)" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <input type="number" id="analytics-value" placeholder="Event Value (optional)" style="width: 100%; padding: 8px; margin-bottom: 12px; border: 1px solid #ddd; border-radius: 4px;">
          <button id="analytics-send" style="width: 100%; padding: 10px; background: #ea4335; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Send Event</button>
        </div>
        <div id="analytics-result" style="padding: 10px; background: #f5f5f5; border-radius: 4px; min-height: 20px; color: #333;"></div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', analyticsHTML);
    
    // Add event listeners
    document.getElementById("analytics-close").addEventListener("click", hideAnalyticsGUI);
    document.getElementById("analytics-send").addEventListener("click", sendAnalyticsEvent);
    document.getElementById("analytics-type").addEventListener("change", toggleAnalyticsFields);
    
    toggleAnalyticsFields(); // Initialize field visibility
  }
}

function toggleAnalyticsFields() {
  const type = document.getElementById("analytics-type").value;
  const categoryField = document.getElementById("analytics-category");
  const actionField = document.getElementById("analytics-action");
  const labelField = document.getElementById("analytics-label");
  const valueField = document.getElementById("analytics-value");
  
  if (type === "pageview") {
    categoryField.style.display = "none";
    actionField.placeholder = "Page URL";
    labelField.style.display = "none";
    valueField.style.display = "none";
  } else {
    categoryField.style.display = "block";
    actionField.placeholder = "Event Action";
    labelField.style.display = "block";
    valueField.style.display = "block";
  }
}

function showAnalyticsGUI() {
  initAnalyticsGUI();
  document.getElementById("analytics-widget").style.display = "block";
}

function hideAnalyticsGUI() {
  const widget = document.getElementById("analytics-widget");
  if (widget) {
    widget.style.display = "none";
  }
}

function sendAnalyticsEvent() {
  const type = document.getElementById("analytics-type").value;
  const category = document.getElementById("analytics-category").value;
  const action = document.getElementById("analytics-action").value;
  const label = document.getElementById("analytics-label").value;
  const value = document.getElementById("analytics-value").value;
  const resultDiv = document.getElementById("analytics-result");
  
  if (!action) {
    resultDiv.innerHTML = '<span style="color: red;">Action/URL is required.</span>';
    return;
  }
  
  if (type === "event" && !category) {
    resultDiv.innerHTML = '<span style="color: red;">Category is required for events.</span>';
    return;
  }
  
  try {
    if (type === "pageview") {
      ga("send", "pageview", action);
      resultDiv.innerHTML = `<span style="color: green;">✓ Page view sent for: ${action}</span>`;
    } else {
      const eventData = {
        hitType: "event",
        eventCategory: category,
        eventAction: action
      };
      
      if (label) eventData.eventLabel = label;
      if (value) eventData.eventValue = parseInt(value);
      
      ga("send", eventData);
      resultDiv.innerHTML = `<span style="color: green;">✓ Event sent: ${category} - ${action}</span>`;
    }
  } catch (error) {
    resultDiv.innerHTML = '<span style="color: red;">Error: Google Analytics not available.</span>';
    console.error('Analytics error:', error);
  }
}

function analytics() {
  showAnalyticsGUI();
}
expose("analytics", analytics);

// Search GUI functionality
function initSearchGUI() {
  if (!document.getElementById("search-widget")) {
    const searchHTML = `
      <div id="search-widget" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border: 2px solid #ccc; border-radius: 8px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; font-family: Arial, sans-serif; min-width: 400px; max-width: 80vw; max-height: 80vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0; color: #333;">Google Search</h3>
          <button id="search-close" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #666;">&times;</button>
        </div>
        <div style="margin-bottom: 15px;">
          <input type="text" id="search-query" placeholder="Enter search query..." style="width: 100%; padding: 8px; margin-bottom: 12px; border: 1px solid #ddd; border-radius: 4px;">
          <button id="search-execute" style="width: 100%; padding: 10px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Search</button>
        </div>
        <div id="search-results" style="padding: 10px; background: #f5f5f5; border-radius: 4px; min-height: 50px; color: #333;"></div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', searchHTML);
    
    // Add event listeners
    document.getElementById("search-close").addEventListener("click", hideSearchGUI);
    document.getElementById("search-execute").addEventListener("click", performSearch);
    document.getElementById("search-query").addEventListener("keypress", function(e) {
      if (e.key === "Enter") performSearch();
    });
  }
}

function showSearchGUI() {
  initSearchGUI();
  document.getElementById("search-widget").style.display = "block";
  document.getElementById("search-query").focus();
}

function hideSearchGUI() {
  const widget = document.getElementById("search-widget");
  if (widget) {
    widget.style.display = "none";
  }
}

async function performSearch() {
  const query = document.getElementById("search-query").value.trim();
  const resultsDiv = document.getElementById("search-results");
  
  if (!query) {
    resultsDiv.innerHTML = '<span style="color: red;">Please enter a search query.</span>';
    return;
  }
  
  try {
    resultsDiv.innerHTML = '<span style="color: #666;">Searching...</span>';
    
    // Since the search API requires backend processing, we'll simulate it for now
    // In a real implementation, this would call the actual search API
    const mockResults = [
      {
        title: "Example Result 1",
        link: "https://example.com/1",
        snippet: "This is a sample search result for demonstration purposes."
      },
      {
        title: "Example Result 2", 
        link: "https://example.com/2",
        snippet: "Another sample result showing how search functionality would work."
      }
    ];
    
    if (mockResults && mockResults.length > 0) {
      let resultsHTML = `<div style="margin-bottom: 10px;"><strong>Search Results for "${query}":</strong></div>`;
      
      mockResults.forEach((result, index) => {
        resultsHTML += `
          <div style="margin-bottom: 15px; padding: 10px; border-left: 3px solid #4285f4; background: white;">
            <div style="font-weight: bold; margin-bottom: 5px;">
              <a href="${result.link}" target="_blank" style="color: #1a0dab; text-decoration: none;">${result.title}</a>
            </div>
            <div style="color: #006621; font-size: 14px; margin-bottom: 3px;">${result.link}</div>
            <div style="color: #545454; font-size: 14px;">${result.snippet}</div>
          </div>
        `;
      });
      
      resultsHTML += '<div style="margin-top: 10px; font-size: 12px; color: #666;">Note: This is a demo using mock data. Real search would use the Google Custom Search API.</div>';
      resultsDiv.innerHTML = resultsHTML;
    } else {
      resultsDiv.innerHTML = '<span style="color: #666;">No results found.</span>';
    }
  } catch (error) {
    resultsDiv.innerHTML = '<span style="color: red;">Error: Could not perform search.</span>';
    console.error('Search error:', error);
  }
}

function search() {
  showSearchGUI();
}
expose("search", search);

function message(msg) {
  var dialog = document.getElementById("message");
  dialog.textContent = msg;
  dialog.setAttribute("open", "");
  setTimeout(function () {
    dialog.removeAttribute("open");
  }, 3000);
}

function prefetch(e) {
  if (e.target.tagName != "A") {
    return;
  }
  if (e.target.origin != location.origin) {
    return;
  }
  /**
   * Return the given url with no fragment
   * @param {string} url potentially containing a fragment
   * @return {string} url without fragment
   */
  const removeUrlFragment = (url) => url.split("#")[0];
  if (
    removeUrlFragment(window.location.href) === removeUrlFragment(e.target.href)
  ) {
    return;
  }
  var l = document.createElement("link");
  l.rel = "prefetch";
  l.href = e.target.href;
  document.head.appendChild(l);
}
document.documentElement.addEventListener("mouseover", prefetch, {
  capture: true,
  passive: true,
});
document.documentElement.addEventListener("touchstart", prefetch, {
  capture: true,
  passive: true,
});

const GA_ID = document.documentElement.getAttribute("ga-id");
window.ga =
  window.ga ||
  function () {
    if (!GA_ID) {
      return;
    }
    (ga.q = ga.q || []).push(arguments);
  };
ga.l = +new Date();
ga("create", GA_ID, "auto");
ga("set", "transport", "beacon");
var timeout = setTimeout(
  (onload = function () {
    clearTimeout(timeout);
    ga("send", "pageview");
  }),
  1000
);

var ref = +new Date();
function ping(event) {
  var now = +new Date();
  if (now - ref < 1000) {
    return;
  }
  ga("send", {
    hitType: "event",
    eventCategory: "page",
    eventAction: event.type,
    eventLabel: Math.round((now - ref) / 1000),
  });
  ref = now;
}
addEventListener("pagehide", ping);
addEventListener("visibilitychange", ping);

/**
 * Injects a script into document.head
 * @param {string} src path of script to be injected in <head>
 * @return {Promise} Promise object that resolves on script load event
 */
const dynamicScriptInject = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.type = "text/javascript";
    document.head.appendChild(script);
    script.addEventListener("load", () => {
      resolve(script);
    });
  });
};

// Script web-vitals.js will be injected dynamically if user opts-in to sending CWV data.
const sendWebVitals = document.currentScript.getAttribute("data-cwv-src");

if (/web-vitals.js/.test(sendWebVitals)) {
  dynamicScriptInject(`${window.location.origin}/js/web-vitals.js`)
    .then(() => {
      webVitals.getCLS(sendToGoogleAnalytics);
      webVitals.getFID(sendToGoogleAnalytics);
      webVitals.getLCP(sendToGoogleAnalytics);
    })
    .catch((error) => {
      console.error(error);
    });
}

addEventListener(
  "click",
  function (e) {
    var button = e.target.closest("button");
    if (!button) {
      return;
    }
    ga("send", {
      hitType: "event",
      eventCategory: "button",
      eventAction: button.getAttribute("aria-label") || button.textContent,
    });
  },
  true
);
var selectionTimeout;
addEventListener(
  "selectionchange",
  function () {
    clearTimeout(selectionTimeout);
    var text = String(document.getSelection()).trim();
    if (text.split(/[\s\n\r]+/).length < 3) {
      return;
    }
    selectionTimeout = setTimeout(function () {
      ga("send", {
        hitType: "event",
        eventCategory: "selection",
        eventAction: text,
      });
    }, 2000);
  },
  true
);

if (window.ResizeObserver && document.querySelector("header nav #nav")) {
  var progress = document.getElementById("reading-progress");

  var timeOfLastScroll = 0;
  var requestedAniFrame = false;
  function scroll() {
    if (!requestedAniFrame) {
      requestAnimationFrame(updateProgress);
      requestedAniFrame = true;
    }
    timeOfLastScroll = Date.now();
  }
  addEventListener("scroll", scroll);

  var winHeight = 1000;
  var bottom = 10000;
  function updateProgress() {
    requestedAniFrame = false;
    var percent = Math.min(
      (document.scrollingElement.scrollTop / (bottom - winHeight)) * 100,
      100
    );
    progress.style.transform = `translate(-${100 - percent}vw, 0)`;
    if (Date.now() - timeOfLastScroll < 3000) {
      requestAnimationFrame(updateProgress);
      requestedAniFrame = true;
    }
  }

  new ResizeObserver(() => {
    bottom =
      document.scrollingElement.scrollTop +
      document.querySelector("#comments,footer").getBoundingClientRect().top;
    winHeight = window.innerHeight;
    scroll();
  }).observe(document.body);
}

function expose(name, fn) {
  exposed[name] = fn;
}

addEventListener("click", (e) => {
  const handler = e.target.closest("[on-click]");
  if (!handler) {
    return;
  }
  e.preventDefault();
  const name = handler.getAttribute("on-click");
  const fn = exposed[name];
  if (!fn) {
    throw new Error("Unknown handler" + name);
  }
  fn(handler);
});

function removeBlurredImage(img) {
  // Ensure the browser doesn't try to draw the placeholder when the real image is present.
  img.style.backgroundImage = "none";
}
document.body.addEventListener(
  "load",
  (e) => {
    if (e.target.tagName != "IMG") {
      return;
    }
    removeBlurredImage(e.target);
  },
  /* capture */ "true"
);
for (let img of document.querySelectorAll("img")) {
  if (img.complete) {
    removeBlurredImage(img);
  }
}
