// Social Analyzer Content Script
// This runs inside the Instagram page context

(function() {
  console.log("Social Analyzer: Content script ready.");

  // Helper to extract usernames from the DOM
  function scrapeUsernames() {
    // This targets the specific anchor tags Instagram uses for user links in lists
    const links = document.querySelectorAll('a[role="link"]');
    const users = new Set();
    
    links.forEach(a => {
      const href = a.getAttribute('href');
      // Filter out non-user links (like locations, hashtags, or posts)
      if(href && href.length > 3 && !href.includes('/p/') && !href.includes('/explore/') && !href.includes('/stories/')) {
         // Remove slashes to get raw username
         users.add(href.replace(/\//g, ''));
      }
    });

    return Array.from(users);
  }

  // Listen for messages from the popup (App.tsx)
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      
      if (request.action === "SCAN_PAGE") {
        const foundUsers = scrapeUsernames();
        console.log(`Social Analyzer: Found ${foundUsers.length} users on screen.`);
        
        sendResponse({ 
          success: true, 
          count: foundUsers.length,
          users: foundUsers,
          url: window.location.href
        });
      }
      
      // Return true to indicate we might respond asynchronously (standard practice)
      return true;
    });
  }
})();