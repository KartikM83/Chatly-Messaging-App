// Chatly mock data for contacts, chats, and messages

export const contacts = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    status: "online",
    bio: "Product Designer | Coffee enthusiast ☕",
  },



  {
    id: "2",
    name: "Mike Chen",
    avatar: "https://api.dicebear.com/7.x/avataaar  s/svg?seed=Mike",
    status: "online",
    bio: "Full-stack developer",
  },
  {
    id: "3",
    name: "Emily Davis",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    status: "away",
    lastSeen: "2 hours ago",
    bio: "Marketing Manager",
  },
  {
    id: "4",
    name: "David Kim",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    status: "offline",
    lastSeen: "yesterday",
    bio: "Photographer 📸",
  },
  {
    id: "5",
    name: "Lisa Anderson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    status: "online",
    bio: "UX Researcher",
  },

  {
    id: "6",
    name: "Kartik Mankar",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    status: "online",
    bio: "Researcher",
  },
  {
    id: "7",
    name: "Sanket Shende",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    status: "online",
    bio: "UX Researcher",
  },

    {
    id: "8",
    name: "Ujwal walde",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    status: "online",
    bio: "UX Researcher",
  },

 

];

export const chats = [
  {
    id: "1",
    contactId: "1",
    lastMessage: "That sounds great! Let's meet at 3 PM",
    timestamp: new Date(Date.now() - 5 * 60000),
    unreadCount: 2,
    isPinned: true,
    archived:false
  },
  {
    id: "2",
    contactId: "2",
    lastMessage: "Did you see the latest updates?",
    timestamp: new Date(Date.now() - 30 * 60000),
    unreadCount: 0,
    isPinned: true,
    isTyping: false,
    archived:false
  },
  {
    id: "3",
    contactId: "3",
    lastMessage: "Thanks for your help! 🙏",
    timestamp: new Date(Date.now() - 2 * 3600000),
    unreadCount: 0,
    isPinned: false,
    archived:true
  },
  {
    id: "4",
    contactId: "4",
    lastMessage: "Check out these photos",
    timestamp: new Date(Date.now() - 24 * 3600000),
    unreadCount: 0,
    isPinned: false,
  },
  {
    id: "5",
    contactId: "5",
    lastMessage: "I'll send you the research findings",
    timestamp: new Date(Date.now() - 48 * 3600000),
    unreadCount: 1,
    isPinned: false,
    archived:true
  },

  {
    id: "6",
    contactId: "6",
    lastMessage: "I'll send you the research findings",
    timestamp: new Date(Date.now() - 48 * 3600000),
    unreadCount: 1,
    isPinned: false,
    archived:false
  },
  
 
  
];

export const messages = [
  {
    id: "1",
    chatId: "1",
    senderId: "1",
    text: "Hey! How are you doing?",
    type: "text",
    timestamp: new Date(Date.now() - 3600000),
    status: "read",
  },
  {
    id: "2",
    chatId: "1",
    senderId: "me",
    text: "I'm great! Working on the new Chatly features",
    type: "text",
    timestamp: new Date(Date.now() - 3500000),
    status: "read",
  },
  {
    id: "3",
    chatId: "1",
    senderId: "1",
    text: "Awesome! Want to grab coffee and discuss?",
    type: "text",
    timestamp: new Date(Date.now() - 3400000),
    status: "read",
  },
  {
    id: "4",
    chatId: "1",
    senderId: "me",
    text: "That sounds great! Let's meet at 3 PM",
    type: "text",
    timestamp: new Date(Date.now() - 5 * 60000),
    status: "delivered",
  },
];
