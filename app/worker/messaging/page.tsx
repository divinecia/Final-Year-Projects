"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, Phone, MessageCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getConversations, sendMessage, markMessagesAsRead, getUserProfile, type Message, type Conversation } from "../../household/messaging/actions"
import { onSnapshot, query, collection, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

type UserProfile = {
    id?: string;
    fullName?: string;
    name?: string;
    phone?: string;
    profilePicture?: string;
};

export default function WorkerMessagingPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [chatRooms, setChatRooms] = React.useState<Conversation[]>([]);
    const [selectedChatRoom, setSelectedChatRoom] = React.useState<Conversation | null>(null);
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [newMessage, setNewMessage] = React.useState("");
    const [loading, setLoading] = React.useState(true);
    const [otherUserProfile, setOtherUserProfile] = React.useState<UserProfile | null>(null);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    // Fetch chat rooms on mount
    React.useEffect(() => {
        if (!user) return;

        const fetchChatRooms = async () => {
            setLoading(true);
            try {
                const rooms = await getConversations(user.uid);
                setChatRooms(rooms);
                if (rooms.length > 0 && !selectedChatRoom) {
                    setSelectedChatRoom(rooms[0]);
                }
            } catch {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not load chat rooms."
                });
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchChatRooms();
        }
    }, [user, authLoading, toast, selectedChatRoom]);

    // Real-time messages subscription
    React.useEffect(() => {
        if (!selectedChatRoom || !user) return;

        const q = query(
            collection(db, "chats", selectedChatRoom.id, "messages"),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedMessages: Message[] = [];
            querySnapshot.forEach((doc) => {
                fetchedMessages.push({ id: doc.id, ...doc.data() } as Message);
            });
            setMessages(fetchedMessages);
            
            // Mark messages as read when they are loaded
            markMessagesAsRead(selectedChatRoom.id, user.uid);
        }, (error) => {
            console.error("Error fetching real-time messages: ", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not load messages."
            });
        });

        return () => unsubscribe();
    }, [selectedChatRoom, user, toast]);

    // Fetch other user's profile
    React.useEffect(() => {
        if (!selectedChatRoom) return;

        const fetchOtherUserProfile = async () => {
            if (!user) return;
            // Get the household ID (the participant that's not the current user)
            const householdId = selectedChatRoom.participants.find(id => id !== user.uid);
            if (householdId) {
                const profile = await getUserProfile(householdId, 'household');
                setOtherUserProfile(profile);
            }
        };

        fetchOtherUserProfile();
    }, [selectedChatRoom, user]);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === "" || !user || !selectedChatRoom) return;

        const content = newMessage;
        setNewMessage("");

        const result = await sendMessage(selectedChatRoom.id, {
            text: content,
            senderId: user.uid,
            senderName: user.displayName || 'Worker',
            senderType: 'worker',
            jobId: selectedChatRoom.jobId,
        });

        if (!result.success) {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error,
            });
            setNewMessage(content);
        }
    };

    const handleCallHousehold = () => {
        if (otherUserProfile?.phone) {
            window.open(`tel:${otherUserProfile.phone}`, '_self');
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Household phone number not available."
            });
        }
    };

    if (loading || authLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1">
                                    <Skeleton className="h-4 w-24 mb-1" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
            {/* Chat Rooms List */}
            <Card className="lg:col-span-1 flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        My Conversations
                    </CardTitle>
                    <CardDescription>Active chats with households</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-2">
                    {chatRooms.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No conversations yet</p>
                    ) : (
                        chatRooms.map((room) => (
                            <div
                                key={room.id}
                                onClick={() => setSelectedChatRoom(room)}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                                    selectedChatRoom?.id === room.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
                                )}
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src="https://placehold.co/100x100.png" />
                                    <AvatarFallback>H</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{room.jobTitle || "Household Chat"}</p>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {room.lastMessage || "No messages yet"}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {/* Chat Panel */}
            <Card className="lg:col-span-3 flex flex-col">
                {selectedChatRoom ? (
                    <>
                        <CardHeader className="flex flex-row items-center gap-4 p-4 border-b">
                            <Avatar>
                                <AvatarImage src={otherUserProfile?.profilePicture || "https://placehold.co/100x100.png"} />
                                <AvatarFallback>{otherUserProfile?.fullName?.charAt(0) || 'H'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold">{otherUserProfile?.fullName || "Household"}</p>
                                <p className="text-sm text-muted-foreground">Household</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleCallHousehold}>
                                <Phone className="h-5 w-5" />
                                <span className="sr-only">Call Household</span>
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => {
                                const isCurrentUser = message.senderId === user?.uid;
                                return (
                                    <div key={message.id} className={cn("flex items-end gap-2", isCurrentUser && "justify-end")}>
                                        {!isCurrentUser && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={otherUserProfile?.profilePicture || "https://placehold.co/100x100.png"} />
                                                <AvatarFallback>{otherUserProfile?.fullName?.charAt(0) || 'H'}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={cn(
                                            "p-3 rounded-lg max-w-xs text-sm", 
                                            isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                                        )}>
                                            <p>{message.text}</p>
                                        </div>
                                        {isCurrentUser && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user?.photoURL || 'https://placehold.co/100x100.png'} />
                                                <AvatarFallback>{user?.displayName?.charAt(0) || 'Me'}</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </CardContent>
                        <div className="p-4 border-t">
                            <form onSubmit={handleSendMessage} className="relative">
                                <Input 
                                    placeholder="Type your message..." 
                                    className="pr-12"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    disabled={authLoading || !user}
                                />
                                <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={!newMessage.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <CardContent className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium">Select a conversation</h3>
                            <p className="text-muted-foreground">Choose a household from the list to start messaging</p>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    )
}
