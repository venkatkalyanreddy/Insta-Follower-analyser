# Social Insight Analyzer (Chrome Extension)

A privacy-focused Chrome Extension that helps you analyze your Instagram connections. It runs entirely locally in your browser to identify users who don't follow you back, track mutual connections, and manage your following list without sharing your password with third-party services.

## Prerequisites

- **Node.js 19** (Required per project settings)
- **NPM** (Included with Node.js)
- **Google Chrome** (or Chromium-based browser like Brave/Edge)

## Installation & Build Guide

Follow these steps to set up the project locally.

### 1. Clone the Repository
Open your terminal and clone the source code:

```bash
git clone <YOUR_REPO_URL_HERE>
cd social-insight-analyzer


2. Install Node.js 19
Ensure you are running Node.js version 19. If you use nvm (Node Version Manager), you can switch easily:
code
Bash
nvm install 19
nvm use 19
If you don't use nvm, download Node v19 from the official Node.js archives.

3. Install Dependencies
Install the required project libraries:
code
Bash
npm install

4. Build the Extension
Compile the React code into a format Chrome can understand. This generates a dist folder.
npm run build
Note: You must run this command every time you make changes to the code.
How to Install in Chrome
Open Google Chrome.
Navigate to chrome://extensions in the address bar.
Toggle the Developer mode switch in the top-right corner.
Click the Load unpacked button (top-left).
Browse to your project directory and select the dist folder (created in step 4).
The extension icon should now appear in your browser toolbar.
How to Use
Since Instagram blocks automated bots, this tool works by scanning the data you load on the screen. Follow this workflow:
Step 1: Scan Followers
Go to your Instagram profile page on a desktop.
Click on your Followers number to open the list modal.
Important: Scroll down the list to load your followers. The extension can only see what is loaded in the browser memory.
Click the Social Insight Analyzer extension icon.
Click Scan Open List. You should see a success message (e.g., "Updated: 450 Followers").
Step 2: Scan Following
Close the extension popup (your data is saved automatically).
Close the "Followers" modal on Instagram and open the Following list.
Scroll down to load the users you follow.
Click the extension icon again.
Click Scan Open List.
Step 3: Analyze & Unfollow
Once both lists are scanned, the "View Analysis" button will activate.
Click it to see the dashboard.
Go to the "Not Back" tab to see people who don't follow you back.
To Unfollow:
Click the Unfollow button next to a user.
This removes them from your list in the app and opens their Instagram profile in a new tab.
Click the "Following" button on the Instagram page to unfollow them.
Close the tab and repeat.
Tips
Full Screen: Click the "Maximize" icon in the extension header to open the dashboard in a full browser tab. This is recommended for managing long lists.
Persistence: Your data is saved locally in the browser. You can close the browser and come back later; the data will still be there until you click "Reset".
