import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Search, User, MessageCircle, Loader2 } from 'lucide-react';

interface Message {
  id: number;
  room_id: number;
  sender_id: number;
  message: string;
  is_read: number;
  created_at: string;
  sender_name: string;
  sender_photo: string;
  sender_role: string;
}

interface ChatRoom {
  room_id: number;
  room_created_at: string;
  other_user_id: number;
  other_user_name: string;
  other_user_role: string;
  unread_count: number;
  last_message: string;
  last_message_time: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface MessagesResponse {
  messages: Message[];
  room_details?: {
    id: number;
    user1_id: number;
    user2_id: number;
    created_at: string;
    user1_name: string;
    user1_photo: string;
    user1_role: string;
    user2_name: string;
    user2_photo: string;
    user2_role: string;
  };
}

interface User {
  id: number;
  name: string;
  role: string;
  photo?: string;
}

interface SearchUsersResponse {
  users: User[];
}

const Chat: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchUsersQuery, setSearchUsersQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showContacts, setShowContacts] = useState(false);

  const API_BASE_URL = 'http://localhost:3000/API';
  const token = localStorage.getItem('token');

  // Debug API configuration
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('Token available:', !!token);

  // Get current user ID from localStorage or token
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      setCurrentUserId(parseInt(userId));
    } else {
      // If user_id is not in localStorage, try to get it from the first message
      // This is a fallback mechanism
      if (messages.length > 0) {
        // Assume the first message sender is the current user if no user_id is stored
        setCurrentUserId(messages[0].sender_id);
      }
    }
  }, [messages]);

  // Load persisted state from localStorage
  useEffect(() => {
    const savedSelectedRoom = localStorage.getItem('mentor_chat_selected_room');
    if (savedSelectedRoom) {
      try {
        setSelectedRoom(JSON.parse(savedSelectedRoom));
      } catch (error) {
        console.error('Error parsing saved room:', error);
      }
    }
  }, []);

  // Save selected room to localStorage
  useEffect(() => {
    if (selectedRoom) {
      localStorage.setItem('mentor_chat_selected_room', JSON.stringify(selectedRoom));
    }
  }, [selectedRoom]);

  // Helper function to check if message is from current user
  const isMessageFromCurrentUser = (message: Message) => {
    if (currentUserId) {
      return message.sender_id === currentUserId;
    }
    // Fallback: if no currentUserId, assume messages with sender_id 1 are from current user
    return message.sender_id === 1;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat rooms
  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching mentor chat rooms...');
      
      const response = await fetch(`${API_BASE_URL}/chat/rooms`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Chat rooms response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          setError('Sesi Anda telah berakhir. Silakan login kembali.');
          return;
        }
        throw new Error('Gagal mengambil daftar chat rooms');
      }

      const result: ApiResponse<ChatRoom[]> = await response.json();
      console.log('Chat rooms response:', result);
      
      if (result.success) {
        setChatRooms(result.data);
        console.log('Chat rooms loaded:', result.data.length);
        // Auto-select first room if available and no room is currently selected
        if (result.data.length > 0 && !selectedRoom) {
          console.log('Auto-selecting first room:', result.data[0]);
          setSelectedRoom(result.data[0]);
        }
      } else {
        setError(result.message || 'Terjadi kesalahan saat mengambil data');
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      setError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (roomId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: roomId,
        }),
      });

      if (response.ok) {
        console.log('Messages marked as read for room:', roomId);
        // Refresh chat rooms to update unread count
        fetchChatRooms();
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Fetch messages for a specific room
  const fetchMessages = async (roomId: number) => {
    try {
      setLoadingMessages(true);
      console.log('Fetching messages for room:', roomId);
      
      // Try the first endpoint structure
      let response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      // If 404, try alternative endpoint structure
      if (response.status === 404) {
        console.log('Trying alternative endpoint structure...');
        response = await fetch(`${API_BASE_URL}/chat/messages?room_id=${roomId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('Alternative endpoint response status:', response.status);
      }

      if (!response.ok) {
        if (response.status === 401) {
          setError('Sesi Anda telah berakhir. Silakan login kembali.');
          return;
        }
        if (response.status === 404) {
          console.error('Endpoint not found. Check if the API endpoint is correct.');
          console.error('Tried endpoints:');
          console.error(`1. ${API_BASE_URL}/chat/rooms/${roomId}/messages`);
          console.error(`2. ${API_BASE_URL}/chat/messages?room_id=${roomId}`);
          setMessages([]);
          return;
        }
        throw new Error(`Gagal mengambil pesan: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<MessagesResponse> = await response.json();
      console.log('API Response:', result);
      
      if (result.success) {
        setMessages(result.data.messages);
        console.log('Messages loaded:', result.data.messages.length);
        
        // Mark messages as read when room is opened
        markMessagesAsRead(roomId);
      } else {
        console.error('API Error:', result.message);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send message
  const sendMessage = async (roomId: number, messageText: string) => {
    try {
      setSendingMessage(true);
      console.log('Sending message to room:', roomId, 'Message:', messageText);
      
      // Create form data for x-www-form-urlencoded format
      const formData = new URLSearchParams();
      formData.append('room_id', roomId.toString());
      formData.append('message', messageText);

      const response = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      console.log('Send message response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          setError('Sesi Anda telah berakhir. Silakan login kembali.');
          return;
        }
        throw new Error(`Gagal mengirim pesan: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<Message> = await response.json();
      console.log('Send message response:', result);
      
      if (result.success) {
        // Add new message to the list
        setMessages(prev => [...prev, result.data]);
        // Refresh chat rooms to update last message
        fetchChatRooms();
        console.log('Message sent successfully');
        
        // Show success feedback (optional - you can remove this if not needed)
        // You can add a toast notification here if you have a toast library
      } else {
        console.error('API Error:', result.message);
        setError('Gagal mengirim pesan. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Gagal mengirim pesan. Periksa koneksi internet Anda.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Refresh chat rooms
  const handleRefresh = () => {
    setRefreshing(true);
    fetchChatRooms();
  };

  // Debounced search for users
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchUsersQuery.trim()) {
        searchUsers(searchUsersQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchUsersQuery]);

  useEffect(() => {
    fetchChatRooms();
    
    // Auto-refresh chat rooms every 30 seconds to keep unread count updated
    const interval = setInterval(() => {
      fetchChatRooms();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      console.log('Selected room changed, fetching messages for room:', selectedRoom.room_id);
      fetchMessages(selectedRoom.room_id);
    }
  }, [selectedRoom]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedRoom) {
      await sendMessage(selectedRoom.room_id, newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hari ini';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Kemarin';
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const filteredRooms = chatRooms.filter(room =>
    room.other_user_name.toLowerCase().includes(searchUsersQuery.toLowerCase())
  );

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'guru': return 'Guru';
      case 'mentor': return 'Mentor';
      case 'siswa': return 'Siswa';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  // Search users for new chat
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchingUsers(true);
      console.log('Searching users with query:', query);
      
      const response = await fetch(`${API_BASE_URL}/chat/search-users?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Search users response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          setError('Sesi Anda telah berakhir. Silakan login kembali.');
          return;
        }
        throw new Error(`Gagal mencari user: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<SearchUsersResponse> = await response.json();
      console.log('Search users response:', result);
      
      if (result.success) {
        setSearchResults(result.data.users);
        setShowSearchResults(true);
        console.log('Users found:', result.data.users.length);
      } else {
        console.error('API Error:', result.message);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  // Create new chat room (open immediately and fetch messages)
  const createChatRoom = async (userId: number, userName: string) => {
    try {
      console.log('Creating or opening chat room with user:', userId, userName);
      // Check if chat room already exists
      const existingRoom = chatRooms.find(room => room.other_user_id === userId);
      if (existingRoom) {
        // Do not allow creating or opening if already exists
        return;
      }
      // If not, create new room using correct API and payload
      const formData = new URLSearchParams();
      formData.append('user2_id', userId.toString());
      const response = await fetch(`${API_BASE_URL}/chat/rooms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      console.log('Create room response status:', response.status);
      if (!response.ok) {
        if (response.status === 401) {
          setError('Sesi Anda telah berakhir. Silakan login kembali.');
          return;
        }
        throw new Error(`Gagal membuat chat room: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      console.log('Create room response:', result);
      if (result.success && result.data && result.data.room && result.data.other_user) {
        // Build new room object for chatRooms
        const newRoom = {
          room_id: result.data.room.id,
          room_created_at: result.data.room.created_at,
          other_user_id: result.data.other_user.other_user_id,
          other_user_name: result.data.other_user.other_user_name,
          other_user_role: result.data.other_user.other_user_role,
          unread_count: 0,
          last_message: '',
          last_message_time: '',
        };
        setChatRooms(prev => [newRoom, ...prev]);
        setSelectedRoom(newRoom);
        setShowNewChatModal(false);
        setSearchUsersQuery('');
        setSearchResults([]);
        // Fetch messages for the new room immediately
        fetchMessages(newRoom.room_id);
        console.log('Chat room created and opened successfully');
      } else {
        console.error('API Error:', result.message);
        setError('Gagal membuat chat room. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error creating chat room:', error);
      setError('Gagal membuat chat room. Periksa koneksi internet Anda.');
    }
  };

  // Fetch available users for new chat
  const fetchAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      setAvailableUsers([]);
      console.log('Fetching available users for new chat...');
      const response = await fetch(`${API_BASE_URL}/chat/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Available users response status:', response.status);
      if (!response.ok) {
        if (response.status === 401) {
          setError('Sesi Anda telah berakhir. Silakan login kembali.');
          return;
        }
        throw new Error(`Gagal mengambil daftar user: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      console.log('Available users raw response:', result);
      let users = [];
      if (result.success && result.data) {
        // Coba beberapa kemungkinan struktur data
        if (Array.isArray(result.data)) {
          users = result.data;
        } else if (Array.isArray(result.data.users)) {
          users = result.data.users;
        } else {
          console.warn('Struktur data users tidak dikenali:', result.data);
        }
      }
      // Log user ids for debugging
      console.log('User list for new chat:', users.map((u: any) => u.id));
      // Filter out users that already have chat rooms
      const existingUserIds = chatRooms.map(room => room.other_user_id);
      const newUsers = users.filter((user: any) => !existingUserIds.includes(user.id));
      // Jika hasil filter kosong, tampilkan semua user untuk debugging
      if (newUsers.length === 0 && users.length > 0) {
        console.warn('Semua user sudah di-chat, tampilkan semua user untuk debugging');
        setAvailableUsers(users);
      } else {
        setAvailableUsers(newUsers);
      }
      console.log('Available users for new chat (after filter):', newUsers.length);
    } catch (error) {
      console.error('Error fetching available users:', error);
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Polling for new messages in the selected chat room
  useEffect(() => {
    if (!selectedRoom) return;
    const interval = setInterval(() => {
      fetchMessages(selectedRoom.room_id);
    }, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [selectedRoom]);

  // Handle new chat button click
  const handleNewChatClick = () => {
    setShowNewChatModal(true);
    fetchAvailableUsers();
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-white">Memuat chat mentor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Terjadi Kesalahan</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowContacts(!showContacts)}
            className="lg:hidden text-gray-400 hover:text-white p-2"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          {selectedRoom && (
            <div>
              <h3 className="text-white font-semibold">{selectedRoom.other_user_name}</h3>
              <p className="text-gray-400 text-sm">{getRoleLabel(selectedRoom.other_user_role)}</p>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleNewChatClick}
            className="text-gray-400 hover:text-white p-2"
            title="Mulai Chat Baru"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden flex-row-reverse">
        {/* Contacts Sidebar */}
        <div className={`
          ${showContacts ? 'block' : 'hidden'} lg:block
          w-full lg:w-80 bg-gray-800 border-l border-gray-700 flex flex-col
        `}>
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari kontak atau user baru..."
                value={searchUsersQuery}
                onChange={(e) => setSearchUsersQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {/* Search Results */}
            {showSearchResults && (
              <div className="border-b border-gray-700">
                <div className="p-3 bg-gray-700/50">
                  <h3 className="text-white font-medium text-sm mb-2">Hasil Pencarian</h3>
                  {searchingUsers ? (
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Mencari...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => createChatRoom(user.id, user.name)}
                          className="flex items-center p-2 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-sm font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-sm">{user.name}</h4>
                            <p className="text-gray-400 text-xs">{getRoleLabel(user.role)}</p>
                          </div>
                          <button className="text-blue-400 hover:text-blue-300 text-xs">
                            Mulai Chat
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Tidak ada user ditemukan</p>
                  )}
                </div>
              </div>
            )}

            {/* Existing Chat Rooms */}
            <div className="p-3 bg-gray-700/50 border-b border-gray-700">
              <h3 className="text-white font-medium text-sm">Chat Terbaru</h3>
            </div>
            
            {filteredRooms.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                {searchUsersQuery ? 'Tidak ada kontak yang ditemukan' : 'Belum ada chat room'}
              </div>
            ) : (
              filteredRooms.map((room) => (
                <div
                  key={room.room_id}
                  onClick={() => {
                    console.log('Room clicked:', room);
                    setSelectedRoom(room);
                    setShowContacts(false);
                  }}
                  className={`flex items-center p-4 hover:bg-gray-700 cursor-pointer transition-colors ${
                    selectedRoom?.room_id === room.room_id ? 'bg-gray-700' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium truncate">{room.other_user_name}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-xs">{formatTime(room.last_message_time)}</span>
                        {room.unread_count > 0 && (
                          <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
                            {room.unread_count > 99 ? '99+' : room.unread_count}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm truncate">{room.last_message}</p>
                    <p className="text-gray-500 text-xs">{getRoleLabel(room.other_user_role)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                      <span className="text-gray-400">Memuat pesan...</span>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-400">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Belum ada pesan</p>
                      <p className="text-sm">Mulai percakapan dengan {selectedRoom.other_user_name}</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const showDate = index === 0 || 
                      formatDate(message.created_at) !== formatDate(messages[index - 1].created_at);
                    // WhatsApp-style: pesan saya di kanan, pesan lawan di kiri
                    const isCurrentUser = message.sender_id === currentUserId;
                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="flex justify-center mb-4">
                            <span className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isCurrentUser
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 text-white'
                          }`}>
                            {/* Nama pengirim dihapus agar seperti WhatsApp */}
                            <p className="text-sm">{message.message}</p>
                            <div className={`flex items-center justify-end mt-1 space-x-1 ${
                              isCurrentUser ? 'text-blue-200' : 'text-gray-400'
                            }`}>
                              <span className="text-xs">{formatTime(message.created_at)}</span>
                              {isCurrentUser && (
                                <span className="text-xs">
                                  {message.is_read === 1 ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex items-end space-x-3">
                  <button className="text-gray-400 hover:text-white p-2">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={sendingMessage ? "Mengirim pesan..." : "Ketik pesan..."}
                      disabled={sendingMessage}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                      rows={1}
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                  </div>
                  <button className="text-gray-400 hover:text-white p-2">
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Pilih Chat</h3>
                <p>Pilih kontak untuk memulai percakapan</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-white font-semibold">Mulai Chat Baru</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari user..."
                  value={searchUsersQuery}
                  onChange={(e) => setSearchUsersQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Memuat daftar user...</span>
                    </div>
                  </div>
                ) : searchUsersQuery ? (
                  // Show search results
                  searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => {
                            createChatRoom(user.id, user.name);
                            setShowNewChatModal(false);
                            setSearchUsersQuery('');
                          }}
                          className="flex items-center p-3 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{user.name}</h4>
                            <p className="text-gray-400 text-sm">{getRoleLabel(user.role)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p>Tidak ada user ditemukan</p>
                    </div>
                  )
                ) : (
                  // Show all available users
                  (() => {
                    const usersToShow = availableUsers.filter((user: any) => !chatRooms.some(room => room.other_user_id === user.id));
                    if (usersToShow.length > 0) {
                      return (
                        <div className="space-y-2">
                          {usersToShow.map((user: any) => (
                            <div
                              key={user.id}
                              onClick={() => {
                                createChatRoom(user.id, user.nama);
                                setShowNewChatModal(false);
                              }}
                              className="flex items-center p-3 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                            >
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-medium">
                                  {typeof user.nama === 'string' && user.nama.length > 0
                                    ? user.nama.charAt(0).toUpperCase()
                                    : '?'}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-white font-medium">
                                  {user.nama || 'Tanpa Nama'}
                                </h4>
                                <p className="text-gray-400 text-sm">{getRoleLabel(user.role)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-center py-8 text-gray-400">
                          <p>Tidak ada user tersedia untuk chat baru</p>
                        </div>
                      );
                    }
                  })()
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
