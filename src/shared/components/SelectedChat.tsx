'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useUserStore } from '@/store/useUserStore'
import { supabase } from '@/services/supabaseClient'
import { jwtDecode } from 'jwt-decode'
import Image from 'next/image'
import { IoIosSearch, IoIosShareAlt } from 'react-icons/io'
import { IoCheckmarkDoneOutline, IoCheckmarkOutline, IoMic, IoSend } from 'react-icons/io5'
import { ImAttachment } from 'react-icons/im'
import { GoClock } from 'react-icons/go'
import { PiClockClockwise } from 'react-icons/pi'
import { HiOutlineChevronUpDown } from 'react-icons/hi2'
import { BsEmojiSmile, BsStars } from 'react-icons/bs'
import { FaUser, FaPollH } from 'react-icons/fa'
import moment from 'moment'

type JwtPayload = {
    id: string
    email?: string
    username?: string
}

const SelectedChat = () => {
    const [inputMessage, setInputMessage] = useState('')
    const [messages, setMessages] = useState<any[]>([])
    const [allUsers, setAllUsers] = useState<any[]>([])
    const [currentUserId, setCurrentUserId] = useState<string>('')
    const user = useUserStore((state) => state.user)
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLTextAreaElement>(null)
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
    const [showUserList, setShowUserList] = useState(false);

    const fetchAllUsers = async () => {
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

        const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, full_name, phone, email');

        if (usersError) {
            console.error('Failed to fetch users:', usersError);
            return;
        }

        setAllUsers(usersData);
    };

    // Step 1: Decode JWT to get current user ID
    useEffect(() => {
        const cookie = document.cookie;
        const tokenMatch = cookie.match(/(?:^|; )access_token=([^;]*)/);
        const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

        if (!token) return;
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            setCurrentUserId(decoded.id);
        } catch (err) {
            console.error('Failed to decode token', err);
        }
        fetchAllUsers()
    }, []);

    // Step 2: Fetch messages
    useEffect(() => {
        if (!currentUserId || !user?.id) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select(`
                            id,
                            content,
                            created_at,
                            sender_id,
                            receiver_id,
                            message_type,
                            sender:sender_id (
                            id,
                            full_name,
                            phone
                            )
                        `)
                .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${currentUserId})`)
                .order('created_at');

            if (error) {
                console.error('Error fetching messages:', error);
                return;
            }

            setMessages(data as any[]);
        };

        fetchMessages();
    }, [currentUserId, user]);

    // Step 3: Setup realtime listener
    useEffect(() => {
        if (!currentUserId || !user?.id) return;

        const channel = supabase
            .channel('realtime-messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    const newMsg = payload.new as any;

                    // Only append relevant messages
                    if (
                        (newMsg.sender_id === currentUserId && newMsg.receiver_id === user.id) ||
                        (newMsg.receiver_id === currentUserId && newMsg.sender_id === user.id)
                    ) {
                        setMessages((prev) => [...prev, newMsg]);
                    }
                }
            ).on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    const updatedMsg = payload.new as any;

                    setMessages((prev) =>
                        prev.map((msg) => (msg.id === updatedMsg.id ? { ...msg, is_read: updatedMsg.is_read } : msg))
                    );
                }
            )

            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [currentUserId, user]);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight - 100;
        }
    }, [messages]);

    useEffect(() => {
        const markMessagesAsRead = async () => {
            if (!currentUserId || !user?.id) return;

            // Update in Supabase
            const { error } = await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('receiver_id', currentUserId)
                .eq('sender_id', user.id)
                .eq('is_read', false);

            if (error) {
                console.error('Failed to mark as read:', error);
                return;
            }

            // Update local state to reflect change
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.sender_id === user.id &&
                        msg.receiver_id === currentUserId &&
                        msg.is_read === false
                        ? { ...msg, is_read: true }
                        : msg
                )
            );
        };

        markMessagesAsRead();
    }, [currentUserId, user]);

    // Step 4: Send message
    const sendMessage = async () => {
        // if (!inputMessage.trim()) return;

        let uploadedUrl = '';

        if (selectedFile) {
            const fileName = `${Date.now()}-${selectedFile.name}`;
            const { data, error: uploadError } = await supabase.storage
                .from('chat-media') // make sure this bucket exists
                .upload(fileName, selectedFile);

            if (uploadError) {
                console.error('Upload failed:', uploadError);
                return;
            }

            const { data: publicUrlData } = supabase
                .storage
                .from('chat-media')
                .getPublicUrl(fileName);

            uploadedUrl = publicUrlData.publicUrl;
        }

        if (!selectedFile && (!inputMessage.trim() && !uploadedUrl)) return;

        const messageToSend = {
            sender_id: currentUserId,
            receiver_id: user.id,
            content: selectedFile ? uploadedUrl : inputMessage,
            message_type: selectedFile ? 'image' : 'text',
        };

        const { error } = await supabase.from('messages').insert(messageToSend);

        if (error) {
            console.error('Failed to send message:', error);
        }

        // Optimistically add message to UI
        // setMessages((prev) => [
        //     ...prev,
        //     {
        //         ...messageToSend,
        //         id: crypto.randomUUID(), // temp ID for UI
        //         created_at: new Date().toISOString(),
        //     },
        // ]);

        setInputMessage('');
        setPreviewImage(null);
        setSelectedFile(null);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto' // Reset height
        }
    };

    const groupedMessages = messages?.reduce((acc, msg) => {
        const dateKey = moment(msg.created_at).startOf('day').format('YYYY-MM-DD');
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(msg);
        return acc;
    }, {});


    const forwardMessage = async (receiverId: any) => {
        if (!selectedMessage || !currentUserId) return;

        const messageToForward = {
            sender_id: currentUserId,
            receiver_id: receiverId,
            content: selectedMessage.content,
            message_type: selectedMessage.message_type,
        };

        const { error } = await supabase.from('messages').insert(messageToForward);

        if (error) {
            console.error('Failed to forward message:', error);
        } else {
            setSelectedMessage(null);
            setShowUserList(false);
        }
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const imageURL = URL.createObjectURL(file);
            setPreviewImage(imageURL);
            setSelectedFile(file);
        } else {
            console.warn('Only images are supported for now.');
        }

    }

    const buttons = [
        {
            icon: <ImAttachment size={16} />, label: 'Attach File', onClick: handleFileClick
        },
        { icon: <BsEmojiSmile size={16} />, label: 'Insert Emoji', onClick: () => { } },
        { icon: <GoClock size={17} />, label: 'Schedule Message', onClick: () => { } },
        { icon: <PiClockClockwise size={18} />, label: 'Resend Later', onClick: () => { } },
        { icon: <BsStars size={18} />, label: 'Magic Suggest', onClick: () => { } },
        { icon: <FaPollH size={17} />, label: 'Create Poll', onClick: () => { } },
        { icon: <IoMic size={18} />, label: 'Voice Message', onClick: () => { } },
    ]

    return (
        <div className="flex-1 w-2xl mx-auto border-r border-gray-300 relative bg-white h-full chatBg ml-0">
            {/* Top Bar */}
            <div className="w-full bg-white h-12 px-2.5 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-gray-300 rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold">
                        <FaUser size={16} className="text-[#fafafa]" />
                    </div>
                    <div className="flex flex-col items-start">
                        <p className="text-sm font-semibold text-black">{user?.full_name}</p>
                        <p className="text-xs text-gray-500">
                            {user?.phone?.startsWith('+91') ? user.phone : `+91 ${user?.phone}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 px-2">
                    <div className="flex items-center justify-center bg-green-500 w-6 h-6 rounded-full text-white text-xs uppercase">
                        {user?.full_name?.slice(0, 1)}
                    </div>
                    <BsStars size={18} className="text-black/80" />
                    <IoIosSearch size={20} className="text-black/80" />
                </div>
            </div>

            {/* Chats */}
            <div className="relative">
                <div
                    className="overflow-y-scroll mb-2 p-2 bg-transparent h-[calc(100vh-230px)]"
                    ref={messagesContainerRef}
                >
                    {Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            {/* Date Label */}
                            <div className="sticky top-0 z-10 flex justify-center py-1">
                                <div className="text-xs bg-gray-200 text-gray-700 px-3 py-0.5 rounded-sm shadow-sm">
                                    {moment(date).isSame(moment(), 'day') ? 'Today' :
                                        moment(date).isSame(moment().subtract(1, 'day'), 'day') ? 'Yesterday' :
                                            moment(date).format('MMM D, YYYY')}
                                </div>
                            </div>

                            {/* Messages */}
                            {msgs?.map((msg: any) => (
                                <div
                                    key={msg.id}
                                    className='flex items-start gap-1 mt-1'>

                                    {msg.sender_id !== currentUserId && (
                                        <div className="bg-gray-300 rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold">
                                            <FaUser size={16} className="text-[#fafafa]" />
                                        </div>
                                    )}

                                    <div
                                        className={`relative p-2 text-sm w-xs max-w-[40%] ${msg.sender_id === currentUserId ? 'bg-[#E2FFD4] ml-auto rounded-l-md rounded-b-md shadow' : 'bg-white shadow rounded-r-md rounded-b-md '}`}
                                    >

                                        {/* share button */}
                                        <button
                                            onClick={() => { setSelectedMessage(msg); setShowUserList(true) }}
                                            className='absolute bottom-0 right-0  h-8 w-8 flex items-center justify-center z-10 cursor-pointer' >
                                            <IoIosShareAlt size={16} className='text-gray-400' />
                                        </button>
                                        <div className='flex justify-between items-center mb-1'>
                                            <span className='font-semibold text-[#9cb7fa]'>
                                                {msg.sender_id === currentUserId ? 'You' : msg.sender?.full_name ?? 'Unknown'}
                                            </span>
                                            <span className='text-gray-400 font-[400] text-xs'>
                                                {msg.sender?.phone ? (msg.sender.phone.startsWith('+91') ? msg.sender.phone : `+91 ${msg.sender.phone}`) : ''}
                                            </span>
                                        </div>
                                        <span className="text-black">
                                            {msg.message_type === 'text' && msg.content}
                                            {/* {msg.message_type === 'image' && (
                                            <Image src={'https://yxssxrtahjrrrjdwtbmg.supabase.co/storage/v1/object/public/chat-media/1747978130735-Gemini_Generated_Image_u20v3ku20v3ku20v.png'} width={200} height={200} alt="Sent media" className="rounded max-w-full max-h-40 mt-1" />
                                        )} */}
                                        </span>
                                        {msg.sender_id === currentUserId && (
                                            <div className="text-xs mr-0 text-right text-gray-500 flex items-center gap-1 mt-1">
                                                <span>{moment(msg.created_at).format('h:mm A')}</span>
                                                {msg.is_read ? (
                                                    <IoCheckmarkDoneOutline size={14} className='text-blue-500' />
                                                ) : (
                                                    <IoCheckmarkOutline size={14} className='text-gray-500' />
                                                )}
                                            </div>
                                        )}
                                        {/* <div className="text-xs text-gray-500 text-right">
                                        {moment(msg.created_at).format('h:mm A')}
                                    </div> */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}

                    {showUserList && (
                        <div className="fixed inset-0 z-20 bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white rounded p-4 max-h-[80vh] overflow-y-auto w-full max-w-md border border-gray-200 shadow">
                                <h2 className="text-lg font-semibold mb-3">Forward to</h2>
                                <ul>
                                    {allUsers?.map((u) => (
                                        <li
                                            key={u.id}
                                            className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 flex items-center gap-2 rounded"
                                            onClick={() => forwardMessage(u.id)}
                                        >
                                            <FaUser size={16} className="mr-2 text-gray-300" />
                                            {u.full_name || u.email}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => setShowUserList(false)}
                                    className="mt-3 text-sm text-gray-500 hover:text-black"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                </div>


            </div>

            {/* Message Section */}
            <section className="w-full bg-white border-t border-gray-300 px-4 py-2 absolute bottom-10 left-0">
                <div className="flex items-center gap-2">
                    {previewImage && (
                        <div className="relative mb-2 w-fit max-w-[200px]">
                            <Image src={previewImage} alt="Preview" width={200} height={200} className="rounded border border-gray-300" />
                            <button
                                onClick={() => {
                                    setPreviewImage(null);
                                    setSelectedFile(null);
                                }}
                                className="absolute top-1 right-1 text-white bg-black/50 rounded-full p-1"
                            >
                                ×
                            </button>
                        </div>
                    )}
                    <textarea
                        rows={1}
                        ref={textareaRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Message..."
                        className="flex-1 resize-none overflow-hidden p-2 text-sm outline-none border-none bg-white min-h-[30px] max-h-[120px] placeholder:text-gray-500 text-neutral-800 font-[500]"
                        onInput={(e) => {
                            e.currentTarget.style.height = 'auto'
                            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
                        }}
                    />
                    <button
                        onClick={sendMessage}
                        className="text-white rounded-md z-10 cursor-pointer">
                        <IoSend size={22} className="text-[#15803D]" />
                    </button>
                </div>

                {/* Icon Bar */}
                <div className="flex items-end justify-between gap-2 mt-2">
                    <div className="flex-1 flex items-end gap-2">
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            {buttons.map(({ icon, label, onClick }, i) => (
                                <div key={i} className="relative group">
                                    <button
                                        className="p-2 rounded hover:bg-gray-100 text-neutral-800 transition-colors"
                                        aria-label={label}
                                        onClick={onClick}
                                    >
                                        {icon}
                                    </button>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-white text-gray-800 border border-gray-200 px-2 py-1 rounded z-10 whitespace-nowrap pointer-events-none">
                                        {label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Profile Selector */}
                    <div className="flex items-end gap-2">
                        <div className="flex items-center border border-gray-300 hover:bg-gray-100 cursor-pointer rounded-md px-2 py-1 text-sm gap-2">
                            <Image
                                src="/assets/logo.svg"
                                alt="User"
                                width={20}
                                height={20}
                                className="rounded-full border border-gray-200"
                            />
                            <span className="font-semibold text-xs">Shyam Radadiya</span>
                            <HiOutlineChevronUpDown size={14} className="text-gray-800" />
                        </div>
                    </div>
                </div>
            </section>
        </div >
    )
}

export default SelectedChat
