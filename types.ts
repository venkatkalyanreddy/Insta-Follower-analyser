
export interface InstagramUserData {
  href: string;
  value: string;
  timestamp: number;
}

export interface RawInstagramEntry {
  title?: string;
  media_list_data?: unknown[];
  string_list_data?: InstagramUserData[];
}

// Simple format from our extraction script
export interface ScriptExportData {
  following: string[];
  followers: string[];
  scanDate: number;
}

// Normalized user object for our app
export interface SocialUser {
  username: string;
  url: string;
  timestamp: number; // When the connection was made
}

export enum TabView {
  UPLOAD = 'UPLOAD',
  DIRECT_IMPORT = 'DIRECT_IMPORT',
  DASHBOARD = 'DASHBOARD',
  NOT_FOLLOWING_BACK = 'NOT_FOLLOWING_BACK',
  FANS = 'FANS',
  MUTUAL = 'MUTUAL'
}

export interface AnalysisStats {
  followersCount: number;
  followingCount: number;
  notFollowingBackCount: number;
  fansCount: number;
  mutualCount: number;
  followRatio: number;
}
