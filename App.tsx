
import React, { useState, useMemo, useEffect } from 'react';
import { SocialUser, TabView, AnalysisStats } from './types';
import { parseInstagramJSON } from './utils/parser';
import FileUpload from './components/FileUpload';
import UserList from './components/UserList';
import DashboardStats from './components/DashboardStats';
import ScriptImporter from './components/ScriptImporter';
import { 
  Instagram, 
  BarChart2, 
  UserX, 
  Users, 
  Heart, 
  ArrowRight,
  Code,
  RefreshCw,
  Trash2,
  Maximize
} from 'lucide-react';

declare const chrome: any;

const App: React.FC = () => {
  // State for raw data
  const [followingList, setFollowingList] = useState<SocialUser[]>([]);
  const [followersList, setFollowersList] = useState<SocialUser[]>([]);
  
  // State for UI
  const [activeTab, setActiveTab] = useState<TabView>(TabView.UPLOAD);
  
  // Extension State
  const [isExtension, setIsExtension] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('');

  // 1. INITIALIZE & LOAD FROM STORAGE
  useEffect(() => {
    // Check if running as extension
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      setIsExtension(true);
      
      const params = new URLSearchParams(window.location.search);
      const isFull = params.get('fullscreen') === 'true';
      setIsFullscreen(isFull);

      // Default tab: Dashboard if fullscreen, otherwise Import/Scan for popup
      if (isFull) {
        setActiveTab(TabView.DASHBOARD);
      } else {
        setActiveTab(TabView.DIRECT_IMPORT); 
      }

      // Load saved data from Chrome Storage
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['following', 'followers'], (result: any) => {
          if (result.following && Array.isArray(result.following)) {
            setFollowingList(result.following);
          }
          if (result.followers && Array.isArray(result.followers)) {
            setFollowersList(result.followers);
          }
        });
      }
    }
  }, []);

  // 2. SAVE TO STORAGE WHENEVER LISTS CHANGE
  // This serves as a backup, but we also explicitly save on critical actions
  useEffect(() => {
    if (isExtension && chrome.storage && chrome.storage.local) {
      if (followingList.length > 0 || followersList.length > 0) {
        chrome.storage.local.set({
          following: followingList,
          followers: followersList
        });
      }
    }
  }, [followingList, followersList, isExtension]);

  // Computed Lists
  const { notFollowingBack, fans, mutual, stats } = useMemo(() => {
    const followingSet = new Set(followingList.map(u => u.username));
    const followersSet = new Set(followersList.map(u => u.username));

    const notFollowingBack = followingList.filter(u => !followersSet.has(u.username));
    const fans = followersList.filter(u => !followingSet.has(u.username));
    const mutual = followingList.filter(u => followersSet.has(u.username));

    const stats: AnalysisStats = {
      followersCount: followersList.length,
      followingCount: followingList.length,
      notFollowingBackCount: notFollowingBack.length,
      fansCount: fans.length,
      mutualCount: mutual.length,
      followRatio: followingList.length > 0 ? followersList.length / followingList.length : 0,
    };

    return { notFollowingBack, fans, mutual, stats };
  }, [followingList, followersList]);

  // Load demo data
  const loadDemoData = () => {
    const now = Date.now() / 1000;
    const makeUser = (id: number, prefix: string) => ({
      username: `${prefix}_user_${id}`,
      url: `https://instagram.com/${prefix}_user_${id}`,
      timestamp: now - (id * 86400 * 5)
    });

    const demoFollowing = Array.from({ length: 150 }, (_, i) => makeUser(i, 'following'));
    const demoFollowers = Array.from({ length: 200 }, (_, i) => makeUser(i + 50, 'follower')); 
    
    for(let i=0; i<50; i++) {
        demoFollowers.push(makeUser(i, 'following')); // Mutuals
    }

    setFollowingList(demoFollowing);
    setFollowersList(demoFollowers);
    setActiveTab(TabView.DASHBOARD);
  };

  const resetData = () => {
    setFollowingList([]);
    setFollowersList([]);
    setActiveTab(isExtension ? TabView.DIRECT_IMPORT : TabView.UPLOAD);
    
    // Clear Extension Storage
    if (isExtension && chrome.storage && chrome.storage.local) {
      chrome.storage.local.clear();
      setScanStatus('Data cleared.');
    }
  };

  const handleScriptImport = (following: string[], followers: string[]) => {
      const now = Date.now() / 1000;
      const toUser = (u: string): SocialUser => ({
          username: u,
          url: `https://instagram.com/${u}`,
          timestamp: now
      });

      // We explicitly check empty arrays so we don't overwrite existing data with empty scans
      if (following.length > 0) setFollowingList(following.map(toUser));
      if (followers.length > 0) setFollowersList(followers.map(toUser));
  };

  // UNFOLLOW LOGIC
  const handleUnfollow = (username: string) => {
    // 1. Update State
    const updatedFollowing = followingList.filter(u => u.username !== username);
    setFollowingList(updatedFollowing);

    // 2. FORCE SAVE to Storage immediately
    // This ensures data persists even if the popup is closed immediately after this function runs
    if (isExtension && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ following: updatedFollowing });
    }
  };

  const openInNewTab = () => {
    if (chrome.tabs) {
      chrome.tabs.create({ url: 'index.html?fullscreen=true' });
    }
  };

  // EXTENSION COMMUNICATION
  const scanCurrentPage = () => {
    setScanStatus('Scanning...');
    if (typeof chrome !== 'undefined' && chrome.tabs) {
       chrome.tabs.query({active: true, currentWindow: true}, (tabs: any) => {
          if (tabs[0].id) {
             chrome.tabs.sendMessage(tabs[0].id, {action: "SCAN_PAGE"}, (response: any) => {
                if (chrome.runtime.lastError) {
                   setScanStatus('Refresh Page & Try Again');
                   return;
                }
                
                if (response && response.success) {
                   const users = response.users || [];
                   const type = response.type; // 'followers' or 'following' or 'unknown'
                   
                   if (users.length === 0) {
                     setScanStatus('No users found. Open a list!');
                     return;
                   }

                   // Logic to intelligently decide where to put data based on what the content script saw
                   if (type === 'followers') {
                      handleScriptImport([], users);
                      setScanStatus(`Updated: ${users.length} Followers`);
                   } else if (type === 'following') {
                      handleScriptImport(users, []);
                      setScanStatus(`Updated: ${users.length} Following`);
                   } else {
                      // Fallback: guess based on URL
                      if (response.url.includes('followers')) {
                         handleScriptImport([], users);
                         setScanStatus(`Updated: ${users.length} Followers`);
                      } else {
                         handleScriptImport(users, []); // Default to following if unsure, usually safer
                         setScanStatus(`Updated: ${users.length} Following`);
                      }
                   }
                } else {
                  setScanStatus('Scan failed.');
                }
             });
          }
       });
    } else {
      setScanStatus('Extension context not found.');
    }
  };

  // DETERMINE LAYOUT MODE
  // Compact Mode = Extension Popup. Fullscreen Mode = New Tab or Web App.
  const isCompact = isExtension && !isFullscreen;
  
  const containerClasses = isCompact 
    ? 'w-extension h-extension overflow-x-hidden bg-gray-50' 
    : 'min-h-screen w-full bg-gray-50';
    
  const mainClasses = isCompact 
    ? 'p-0' 
    : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full';

  const listContainerHeight = isCompact ? 'h-[400px]' : 'h-[600px] lg:h-[700px]';

  return (
    <div className={`flex flex-col font-sans ${containerClasses}`}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className={`mx-auto px-4 h-16 flex items-center justify-between ${isCompact ? 'w-full' : 'max-w-7xl sm:px-6 lg:px-8'}`}>
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-1.5 rounded-lg shadow-md">
              <Instagram className="text-white w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-gray-800">
              {isExtension ? 'InstaInsight' : 'Social Analyzer'}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            {(followingList.length > 0 || followersList.length > 0) && (
              <button 
              onClick={resetData}
              className="text-xs font-medium text-gray-500 hover:text-red-500 transition-colors px-2 py-1 hover:bg-red-50 rounded-lg flex items-center space-x-1"
              title="Clear all data"
            >
              <Trash2 size={12} />
              <span>Reset</span>
            </button>
            )}

            {isExtension && isCompact && (
              <button 
                onClick={openInNewTab}
                className="text-xs font-medium text-gray-500 hover:text-purple-600 transition-colors p-2 hover:bg-purple-50 rounded-lg"
                title="Open in new tab (Fullscreen)"
              >
                <Maximize size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 ${mainClasses}`}>
        
        {activeTab === TabView.UPLOAD || activeTab === TabView.DIRECT_IMPORT ? (
          <div className={isCompact ? 'p-4' : 'max-w-2xl mx-auto mt-6 animate-in slide-in-bottom'}>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
               {/* Toggle Tabs (Only show if not extension) */}
               {!isExtension && (
                 <div className="flex border-b border-gray-100">
                    <button 
                      onClick={() => setActiveTab(TabView.UPLOAD)}
                      className={`flex-1 py-4 text-center font-medium text-sm transition-colors ${activeTab === TabView.UPLOAD ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      File Upload
                    </button>
                    <button 
                      onClick={() => setActiveTab(TabView.DIRECT_IMPORT)}
                      className={`flex-1 py-4 text-center font-medium text-sm transition-colors flex items-center justify-center space-x-2 ${activeTab === TabView.DIRECT_IMPORT ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <Code size={16} />
                      <span>Script / Scan</span>
                    </button>
                 </div>
               )}

               <div className="p-6">
                  {/* Extension Mode Scanner UI */}
                  {isExtension ? (
                     <div className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-800 text-xs border border-blue-100">
                          <p className="leading-relaxed">
                            <strong>Step 1:</strong> Open "Followers" on Instagram. Scroll to load all.<br/>
                            <strong>Step 2:</strong> Click <b>Scan</b> below.<br/>
                            <strong>Step 3:</strong> Close this, open "Following", scroll, and <b>Scan</b> again.<br/>
                            <em>Data is saved automatically!</em>
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-center text-xs font-semibold mb-2">
                           <div className={`p-3 rounded-xl border flex flex-col justify-center items-center ${followersList.length > 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                             <span className="text-xl mb-1">{followersList.length}</span>
                             <span>Followers</span>
                           </div>
                           <div className={`p-3 rounded-xl border flex flex-col justify-center items-center ${followingList.length > 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                             <span className="text-xl mb-1">{followingList.length}</span>
                             <span>Following</span>
                           </div>
                        </div>

                        <button 
                          onClick={scanCurrentPage}
                          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2"
                        >
                          <RefreshCw size={18} />
                          <span>Scan Open List</span>
                        </button>
                        
                        {scanStatus && (
                          <p className="text-center text-xs font-mono text-gray-600 h-4">{scanStatus}</p>
                        )}

                        <div className="border-t border-gray-100 my-4"></div>

                        <button
                            disabled={followingList.length === 0 || followersList.length === 0}
                            onClick={() => setActiveTab(TabView.DASHBOARD)}
                            className={`w-full py-3 rounded-xl flex items-center justify-center space-x-2 font-semibold transition-all duration-200
                            ${followingList.length > 0 && followersList.length > 0 
                                ? 'bg-gray-900 text-white shadow-lg cursor-pointer' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                            <span>View Analysis</span>
                            <ArrowRight size={18} />
                        </button>
                     </div>
                  ) : (
                    /* Web App Mode Content */
                    activeTab === TabView.UPLOAD ? (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <FileUpload 
                                label="Upload following.json" 
                                isLoaded={followingList.length > 0}
                                onFileLoaded={(content) => setFollowingList(parseInstagramJSON(content))}
                                />
                                <FileUpload 
                                label="Upload followers.json" 
                                isLoaded={followersList.length > 0}
                                onFileLoaded={(content) => setFollowersList(parseInstagramJSON(content))}
                                />
                            </div>

                            <button
                                disabled={followingList.length === 0 || followersList.length === 0}
                                onClick={() => setActiveTab(TabView.DASHBOARD)}
                                className={`w-full py-3.5 rounded-xl flex items-center justify-center space-x-2 font-semibold transition-all duration-200 mt-4
                                ${followingList.length > 0 && followersList.length > 0 
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                                <span>Analyze Profile</span>
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                           <ScriptImporter onDataImported={handleScriptImport} />
                        </div>
                    )
                  )}
               </div>
            </div>

            {!isExtension && (
              <div className="text-center mt-8">
                <button 
                  onClick={loadDemoData}
                  className="text-sm font-medium text-gray-500 hover:text-purple-600 underline decoration-dashed underline-offset-4"
                >
                  Try with Demo Data
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-in zoom-in">
            {/* Navigation Tabs - Compact for Extension Popup, Relaxed for Fullscreen */}
            <div className={`bg-white p-1 rounded-xl shadow-sm border border-gray-100 inline-flex flex-wrap gap-1 ${isCompact ? 'w-full justify-between' : 'w-full sm:w-auto'}`}>
              <button 
                onClick={() => setActiveTab(TabView.DASHBOARD)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === TabView.DASHBOARD ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <BarChart2 size={14} />
                {!isCompact && <span>Overview</span>}
              </button>
              <button 
                onClick={() => setActiveTab(TabView.NOT_FOLLOWING_BACK)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === TabView.NOT_FOLLOWING_BACK ? 'bg-rose-50 text-rose-600 shadow-sm ring-1 ring-rose-200' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <UserX size={14} />
                {!isCompact && <span>Not Back</span>}
              </button>
              <button 
                onClick={() => setActiveTab(TabView.FANS)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === TabView.FANS ? 'bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-200' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Heart size={14} />
                {!isCompact && <span>Fans</span>}
              </button>
              <button 
                onClick={() => setActiveTab(TabView.MUTUAL)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === TabView.MUTUAL ? 'bg-violet-50 text-violet-600 shadow-sm ring-1 ring-violet-200' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Users size={14} />
                {!isCompact && <span>Mutuals</span>}
              </button>
            </div>

            {/* Content Area */}
            <div className={isCompact ? 'min-h-[400px] pb-4' : 'min-h-[500px]'}>
              {activeTab === TabView.DASHBOARD && <DashboardStats stats={stats} />}
              
              {activeTab === TabView.NOT_FOLLOWING_BACK && (
                <div className={listContainerHeight}>
                  <UserList 
                    title="Not Following Back" 
                    users={notFollowingBack} 
                    colorClass="text-rose-500" 
                    emptyMessage="Everyone follows you back!"
                    onUnfollow={handleUnfollow}
                    showUnfollowHint={true}
                  />
                </div>
              )}

              {activeTab === TabView.FANS && (
                <div className={listContainerHeight}>
                  <UserList 
                    title="Fans" 
                    users={fans} 
                    colorClass="text-emerald-500" 
                    emptyMessage="No fans found."
                  />
                </div>
              )}

              {activeTab === TabView.MUTUAL && (
                 <div className={listContainerHeight}>
                  <UserList 
                    title="Mutual Connections" 
                    users={mutual} 
                    colorClass="text-violet-500" 
                    emptyMessage="No mutual connections found."
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
