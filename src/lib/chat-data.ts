export interface ContactType {
  id: string;
  name: string;
  phone: string;
  image?: string;
  online?: boolean;
  lastMessage?: {
    content: string;
    time: string;
    type: "text" | "photo" | "document";
    status: "sent" | "delivered" | "read";
  };
  unreadCount?: number;
}

export interface MessageType {
  id: string;
  content: string;
  time: string;
  type: "text" | "photo" | "document";
  status: "sent" | "delivered" | "read";
  senderId: string;
}

// Sample data
export const contactsData: ContactType[] = [
  {
    id: "jio-1",
    name: "Jio",
    phone: "+91 87999 36000",
    lastMessage: {
      content: "Your recharge of ₹239 was successful",
      time: "12:30 PM",
      type: "text",
      status: "read",
    },
    unreadCount: 0,
  },
  {
    id: "kavitech-2",
    name: "Kavitech",
    phone: "+91 81280 66108",
    lastMessage: {
      content: "Photo",
      time: "09:18",
      type: "photo",
      status: "delivered",
    },
    unreadCount: 3,
  },
  {
    id: "unknown-3",
    name: "+91 92896 65999",
    phone: "+91 92896 65999",
    lastMessage: {
      content: "Hello, are you available?",
      time: "Yesterday",
      type: "text",
      status: "delivered",
    },
  },
  {
    id: "unknown-4",
    name: "+1 201 975 1250",
    phone: "+1 201 975 1250",
    lastMessage: {
      content: "Please check the documents I sent",
      time: "Yesterday",
      type: "text",
      status: "read",
    },
  },
  {
    id: "priyank-5",
    name: "Priyank Vyas",
    phone: "+91 81280 66108",
    lastMessage: {
      content: "Document",
      time: "19-May-25",
      type: "document",
      status: "delivered",
    },
  },
  {
    id: "aniket-6",
    name: "Aniket",
    phone: "+91 81280 66108",
    lastMessage: {
      content: "Okey brooo",
      time: "19-May-25",
      type: "text",
      status: "read",
    },
  },
  {
    id: "gunjan-7",
    name: "Gunjan Dii",
    phone: "+91 81280 66108",
    lastMessage: {
      content: "Ok",
      time: "18-May-25",
      type: "text",
      status: "read",
    },
  },
  {
    id: "papa-8",
    name: "Papa",
    phone: "+91 81280 66108",
    lastMessage: {
      content: "Call me when you're free",
      time: "18-May-25",
      type: "text",
      status: "read",
    },
  },
  {
    id: "vivek-09",
    name: "Vivek",
    phone: "+91 81280 66108",
    lastMessage: {
      content: "Photo",
      time: "09:18",
      type: "photo",
      status: "delivered",
    },
    unreadCount: 1,
  },
  {
    id: "Google",
    name: "+91 92896 65999",
    phone: "+91 92896 65999",
    lastMessage: {
      content: "Hello, are you available?",
      time: "Yesterday",
      type: "text",
      status: "delivered",
    },
  },
];

// Sample messages data
export const messagesData: Record<string, MessageType[]> = {
  "jio-1": [
    {
      id: "1",
      content: "Your recharge of ₹239 was successful",
      time: "12:30 PM",
      type: "text",
      status: "read",
      senderId: "jio-1",
    },
    {
      id: "2",
      content: "Thank you for using Jio services",
      time: "12:31 PM",
      type: "text",
      status: "read",
      senderId: "jio-1",
    },
  ],
  "kavitech-2": [
    {
      id: "1",
      content: "Hello, I'm sending you the project images",
      time: "09:15",
      type: "text",
      status: "read",
      senderId: "kavitech-2",
    },
    {
      id: "2",
      content: "Project Design Image",
      time: "09:16",
      type: "photo",
      status: "read",
      senderId: "kavitech-2",
    },
    {
      id: "3",
      content: "Let me know what you think",
      time: "09:18",
      type: "text",
      status: "delivered",
      senderId: "kavitech-2",
    },
  ],
  "priyank-5": [
    {
      id: "1",
      content: "Hey, check this document",
      time: "Yesterday",
      type: "text",
      status: "read",
      senderId: "priyank-5",
    },
    {
      id: "2",
      content: "Project Proposal",
      time: "Yesterday",
      type: "document",
      status: "read",
      senderId: "priyank-5",
    },
    {
      id: "3",
      content: "Thanks, I'll review it",
      time: "19-May-25",
      type: "text",
      status: "delivered",
      senderId: "me",
    },
  ],
};

export function getMessages(contactId: string): MessageType[] {
  return messagesData[contactId] || [];
}
