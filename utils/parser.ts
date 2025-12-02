import { RawInstagramEntry, SocialUser, ScriptExportData } from '../types';

/**
 * Parses JSON content. 
 * Supports: 
 * 1. Official Instagram Data Export (complex nested structure)
 * 2. Our Custom Direct Script Export (simple flat arrays)
 */
export const parseInstagramJSON = (jsonString: string): SocialUser[] => {
  try {
    const data = JSON.parse(jsonString);
    const users: SocialUser[] = [];

    // CASE 1: Our Direct Script/Extension Format (Array of strings)
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
      // Simple string array
      return data.map(username => ({
        username,
        url: `https://www.instagram.com/${username}`,
        timestamp: Date.now() / 1000
      }));
    }

    // CASE 2: Official Export Format helpers
    const extractFromEntry = (entry: RawInstagramEntry) => {
      if (entry.string_list_data && Array.isArray(entry.string_list_data)) {
        entry.string_list_data.forEach(item => {
          users.push({
            username: item.value,
            url: item.href,
            timestamp: item.timestamp
          });
        });
      }
    };

    if (Array.isArray(data)) {
      // Standard format: Array of entries
      data.forEach((entry: any) => {
        if (entry.string_list_data) {
          extractFromEntry(entry);
        } else if (entry.relationships_following) {
             (entry.relationships_following as any[]).forEach(extractFromEntry);
        }
      });
    } else if (typeof data === 'object') {
      // Sometimes the root object has keys like "relationships_following"
      const keys = Object.keys(data);
      keys.forEach(key => {
        const val = data[key];
        if (Array.isArray(val)) {
           val.forEach((item: any) => {
             if (item.string_list_data) extractFromEntry(item);
           });
        }
      });
    }

    return users;
  } catch (e) {
    console.error("Failed to parse JSON", e);
    return [];
  }
};