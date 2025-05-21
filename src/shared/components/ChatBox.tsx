'use client';

import { contactsData } from '@/lib/chat-data';
import { useState } from 'react';
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

export default function ChatBox() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'All' | 'Unread'>('All');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const filteredChats = contactsData?.filter((chat: Chat) => {
        const matchesSearch = chat.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || chat.unreadCount > 0;
        return matchesSearch && matchesFilter;
    });

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
                        {/* <select
                            className="text-sm border rounded h-7"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as 'All' | 'Unread')}
                        >
                            <option value="All">Full</option>
                            <option value="Unread">Unread</option>
                        </select> */}
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
                {filteredChats?.map((chat) => (
                    <div
                        key={chat.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-100 border-b border-gray-100"
                    >
                        <div className="flex gap-3 items-center">
                            <div className="bg-gray-300 rounded-full h-10 w-10 flex items-center justify-center text-sm font-bold border border-neutral-200">
                                <FaUser size={16} className='text-[#fafafa]' />
                            </div>
                            <div>
                                <div className="font-semibold text-black">{chat.name}</div>
                                <div className="text-xs text-gray-600 truncate max-w-[180px]">
                                    {chat.lastMessage.content}
                                </div>
                            </div>
                        </div>
                        <div className="text-right text-xs text-gray-500 flex flex-col items-end gap-1">
                            <span>{chat.lastMessage.time}</span>
                            {chat.unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] px-2 rounded-full">
                                    {chat.unreadCount}
                                </span>
                            )}
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
