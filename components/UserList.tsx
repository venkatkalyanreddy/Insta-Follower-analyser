import React, { useState, useMemo } from 'react';
import { SocialUser } from '../types';
import { ExternalLink, Search, Calendar, UserMinus, Info } from 'lucide-react';

interface UserListProps {
  users: SocialUser[];
  title: string;
  colorClass: string;
  emptyMessage: string;
  onUnfollow?: (username: string) => void;
  showUnfollowHint?: boolean;
}

const UserList: React.FC<UserListProps> = ({ 
  users, 
  title, 
  colorClass, 
  emptyMessage,
  onUnfollow,
  showUnfollowHint
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className={`p-4 border-b border-gray-100 ${colorClass} bg-opacity-5`}>
        <div className="flex justify-between items-center mb-3">
          <h2 className={`text-lg font-bold ${colorClass}`}>{title} <span className="text-xs font-normal text-gray-500 ml-1">({filteredUsers.length})</span></h2>
        </div>
        
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {showUnfollowHint && filteredUsers.length > 0 && (
            <div className="flex items-start space-x-2 bg-blue-50 text-blue-700 p-2 rounded-lg text-xxs leading-tight">
              <Info size={12} className="mt-0.5 flex-shrink-0" />
              <p>
                <strong>Tip:</strong> Click "Unfollow" to open their profile. You must then click the "Following" button on Instagram yourself.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
            <p>{searchTerm ? 'No matches' : emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredUsers.map((user) => (
              <div key={user.username} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${colorClass.replace('text-', 'bg-')}`}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-800 text-sm truncate">{user.username}</div>
                    {user.timestamp > 0 && (
                       <div className="text-xxs text-gray-400 flex items-center">
                         <Calendar size={8} className="mr-1" />
                         {new Date(user.timestamp * 1000).toLocaleDateString()}
                       </div>
                    )}
                  </div>
                </div>
                
                {onUnfollow ? (
                  <button 
                    onClick={() => {
                      // Open profile in new tab
                      window.open(user.url, '_blank');
                      // Remove from list visually
                      onUnfollow(user.username);
                    }}
                    className="flex-shrink-0 flex items-center space-x-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-semibold transition-colors border border-red-100 hover:border-red-200"
                    title="Open profile to Unfollow"
                  >
                    <UserMinus size={12} />
                    <span>Unfollow</span>
                  </button>
                ) : (
                  <a 
                    href={user.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all"
                    title="View on Instagram"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;