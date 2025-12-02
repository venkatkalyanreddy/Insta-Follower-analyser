// Social Analyzer Content Script
// This runs inside the Instagram page context

(function() {
  console.log("Social Analyzer: Content script ready.");

  // Helper to extract usernames from the DOM
  function scrapeUsernames() {
    // 1. Target the Modal specifically to avoid background feed links
    const modal = document.querySelector('div[role="dialog"]');
    const root = modal || document; // Fallback to document if no modal (unlikely for lists)

    // 2. Locate "Suggested for you" header to stop scraping
    // Instagram usually labels this section clearly in a span or div
    let suggestedHeader = null;
    if (modal) {
        // Search all text-containing elements for the specific phrase
        const candidates = modal.querySelectorAll('span, div, h4, h3');
        for (const el of candidates) {
            if (el.textContent.trim() === 'Suggested for you') {
                suggestedHeader = el;
                break;
            }
        }
    }

    // 3. Find all links
    const links = root.querySelectorAll('a');
    const users = new Set();

    for (const a of links) {
      // If we found a "Suggested" header, and this link appears AFTER it in the DOM, skip it.
      if (suggestedHeader && (suggestedHeader.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING)) {
         continue;
      }

      const href = a.getAttribute('href');
      
      // Basic validation: Must be a relative link, no dots (files), no complex paths
      if (!href || !href.startsWith('/') || href.includes('.') || href.length < 2) continue;

      // Filter out common non-user pages
      const invalid = [
        '/p/', '/explore/', '/stories/', '/reels/', '/direct/', 
        '/accounts/', '/emails/', '/legal/', '/about/', '/help/'
      ];
      if (invalid.some(sub => href.includes(sub))) continue;

      // Remove slashes
      const username = href.replace(/\//g, '');
      
      // Validate username format (letters, numbers, underscores, periods)
      if (!/^[a-zA-Z0-9._]+$/.test(username)) continue;

      users.add(username);
    }

    return Array.from(users);
  }

  // Listen for messages from the popup (App.tsx)
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      
      if (request.action === "SCAN_PAGE") {
        const foundUsers = scrapeUsernames();
        console.log(`Social Analyzer: Found ${foundUsers.length} users on screen.`);
        
        // Determine context (Followers vs Following) based on URL or Modal Title
        let type = 'unknown';
        const url = window.location.href;
        if (url.includes('followers')) type = 'followers';
        else if (url.includes('following')) type = 'following';
        
        // Try to read modal title as fallback
        const modalTitle = document.querySelector('div[role="dialog"] h1');
        if (modalTitle) {
            const title = modalTitle.textContent.toLowerCase();
            if (title.includes('followers')) type = 'followers';
            if (title.includes('following')) type = 'following';
        }

        sendResponse({ 
          success: true, 
          count: foundUsers.length,
          users: foundUsers,
          url: url,
          type: type
        });
      }
      
      return true;
    });
  }
})();