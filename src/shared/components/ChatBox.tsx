'use client';

import { contactsData } from '@/lib/chat-data';
import { supabase } from '@/services/supabaseClient';
import { useUserStore } from '@/store/useUserStore';
import { useDebounce } from '@/utils/useDebounce';
import { jwtDecode } from 'jwt-decode';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { FaPhone, FaUser } from 'react-icons/fa';
import { IoIosSearch, IoMdClose } from 'react-icons/io';
import { IoFilterOutline } from 'react-icons/io5';
import { MdOutlineSettingsPhone } from 'react-icons/md';
import { RiFolderDownloadFill } from 'react-icons/ri';
import { TbMessageCirclePlus } from 'react-icons/tb';

type Message = {
    content: string;
    time: string;
    type: 'text' | 'video';
    status: 'read' | 'unread';
};

type Chat = {
    id: string;
    name: string;
    phone: string;
    lastMessage: Message;
    unreadCount: number;
};

type JwtPayload = {
    id: string;
    email?: string;
    username?: string;
};


export default function ChatBox() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'All' | 'Unread'>('All');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const { setUser: setSelectedChatUser, user: currentUser } = useUserStore();

    const fetchAllUsers = useCallback(async () => {
        let userId: string | undefined;

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user?.id) {
            userId = user.id;
        } else {
            const cookieString = document.cookie;
            const tokenMatch = cookieString.match(/(?:^|; )access_token=([^;]*)/);
            const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

            if (token) {
                try {
                    const decoded = jwtDecode<JwtPayload>(token);
                    userId = decoded.id;
                } catch (err) {
                    console.error('Failed to decode token', err);
                }
            }
        }

        if (!userId) {
            console.error('User ID not found');
            return;
        }

        // Fetch all users
        const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, full_name, phone, email');

        if (usersError) {
            console.error('Failed to fetch users:', usersError);
            return;
        }

        // Fetch last messages using SQL function
        const { data: lastMessages, error: lastMessagesError } = await supabase
            .rpc('get_last_messages_by_user', { current_user_id: userId });

        if (lastMessagesError) {
            console.error('Failed to fetch last messages:', lastMessagesError);
            return;
        }

        // Fetch unread counts using SQL function
        const { data: unreadCounts, error: unreadError } = await supabase
            .rpc('get_unread_counts_by_sender', { receiver: userId });

        if (unreadError) {
            console.error('Failed to fetch unread counts:', unreadError);
            return;
        }

        const unreadMap = new Map<string, number>(
            unreadCounts.map((row: any) => [row.sender_id, row.unread_count])
        );

        const usersWithDetails = usersData.map((user: any) => {
            const lastMsg = lastMessages.find((m: any) =>
                (m.sender_id === user.id && m.receiver_id === userId) ||
                (m.receiver_id === user.id && m.sender_id === userId)
            );

            return {
                ...user,
                lastMessage: lastMsg?.content || '',
                lastMessageTime: lastMsg?.created_at || '',
                unreadCount: unreadMap.get(user.id) || 0,
            };
        });

        setAllUsers(usersWithDetails);
        setUsers(usersWithDetails);
    }, []);


    useEffect(() => {
        const channel = supabase
            .channel('global-message-listener')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                async (payload) => {
                    const newMessage = payload.new;

                    // Optional: Only react if you're the receiver
                    if (newMessage.receiver_id === currentUser.id) {
                        // Re-fetch messages or just unread counts
                        fetchAllUsers(); // This should update the chat list with latest unread counts
                    }
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [currentUser]);


    // 🔍 Handle search term change
    useEffect(() => {
        if (debouncedSearchTerm.trim() === '') {
            setUsers(allUsers);
            return;
        }

        const searchUsers = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .or(
                    `email.ilike.%${debouncedSearchTerm}%,full_name.ilike.%${debouncedSearchTerm}%,phone.ilike.%${debouncedSearchTerm}%`
                );

            if (error) {
                console.error('Search error:', error);
            } else {
                setUsers(data);
            }
        };

        searchUsers();
    }, [debouncedSearchTerm, allUsers]);



    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);


    const handleChatClick = (user: any) => {
        setSelectedChatUser(user);
    };
    return (
        <div className="flex-1 w-sm max-w-sm mx-auto border-r border-gray-300 relative bg-white h-full">
            {/* Top Bar */}
            <div className="flex items-center justify-between h-12 px-2 border-b border-gray-200 bg-gray-50">
                {!isSearchOpen ? (
                    <div className='flex items-center gap-3'>
                        <div className="flex justify-center items-center w-7 h-7 rounded-full bg-white border-gray-200 border-2 shadow hover:bg-gray-100">
                            <MdOutlineSettingsPhone size={18} className='text-neutral-800' />
                        </div>

                        <div className='flex items-center gap-1'>
                            <RiFolderDownloadFill size={18} className='text-gray-700' />
                            <span className="text-sm text-gray-700 font-semibold">Inbox</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center gap-2 flex-1">
                        <div className="flex justify-center items-center w-7 h-7 rounded-full bg-white border-gray-200 border-2 shadow hover:bg-gray-100">
                            <MdOutlineSettingsPhone size={18} className='text-neutral-800' />
                        </div>
                        <div className='flex items-center gap-1 bg-white h-7 rounded border border-gray-200 px-2 py-1'>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setIsSearchOpen(false);
                                }}
                                className="text-xl"
                            >
                                <IoMdClose size={14} className='text-neutral-800' />
                            </button>
                            <input
                                type="text"
                                autoFocus
                                placeholder="Search"
                                className="flex-1 outline-none border-none text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className='flex items-center gap-1 bg-gray-200 text-neutral-700 text-xs rounded px-1 '>
                                Full
                                <IoIosSearch size={16} className='text-neutral-800' />
                            </div>
                        </div>
                        <div />
                    </div>
                )}

                {/* Optional Filter Button (right side) */}
                <div className={`flex items-center gap-2 `}>
                    {!isSearchOpen && <button
                        onClick={() => setIsSearchOpen(true)}
                        className="border border-gray-200 px-3 h-7 bg-white rounded hover:bg-gray-100 text-sm text-gray-800 flex items-center gap-1"
                    >
                        <IoIosSearch size={18} className="text-gray-800 font-semibold" />
                    </button>}
                    <button className="border border-gray-200 px-3 h-7 bg-white rounded hover:bg-gray-100 text-sm text-gray-800 flex items-center gap-1">
                        <IoFilterOutline size={18} className='text-neutral-800' />
                        Filter
                    </button>

                </div>
            </div>

            {/* Chat List */}
            <div className="flex flex-col overflow-y-auto h-[calc(100vh-72px)]  scrollbar-thin">
                {users?.map((chat: any) => (
                    <div
                        key={chat.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-100 border-b border-gray-100"
                        onClick={() => handleChatClick(chat)}
                    >
                        <div className="flex gap-3 items-center">
                            <div className="bg-gray-300 rounded-full h-10 w-10 flex items-center justify-center text-sm font-bold border border-neutral-200">
                                <FaUser size={16} className='text-[#fafafa]' />
                            </div>
                            <div>
                                <div className="font-semibold text-black">{chat.full_name}</div>
                                <div className="text-xs text-gray-600 truncate max-w-[180px]">
                                    {chat?.phone?.startsWith('+91') ? `${chat.phone} ${chat.content || ""}` : `${chat.phone} ${chat.content || ""}`}
                                </div>
                            </div>
                        </div>
                        <div className="text-right text-xs text-gray-500 flex flex-col items-end gap-1">
                            <span>
                                {moment(chat.created_at).isSame(moment(), 'day') ? (
                                    moment(chat.created_at).format('h:mm A')
                                ) : moment(chat.created_at).isSame(moment().subtract(1, 'day'), 'day') ? (
                                    'Yesterday'
                                ) : (
                                    moment(chat.created_at).format('MMM D, YYYY')
                                )}
                            </span>
                            {chat.unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] px-2 rounded-full">
                                    {chat.unreadCount}
                                </span>
                            )} */}
                            <FaPhone className="w-4 h-4 text-blue-500" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Action Button */}
            <button className="absolute bottom-14 right-6 bg-[#15803d] p-2 rounded-full shadow-2xl cursor-pointer hover:scale-110 transition-all duration-500">
                <TbMessageCirclePlus size={24} className="text-white" />
            </button>
        </div>
    );
}
