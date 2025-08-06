
"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, Archive, Briefcase, MessageSquare, Star, Wallet, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { collection, query, where, orderBy, getDocs, Timestamp, doc, writeBatch } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { formatDistanceToNow } from "date-fns"

type Notification = {
    id: string;
    title: string;
    description: string;
    createdAt: Timestamp;
    read: boolean;
};

// Helper to determine the icon based on the notification title
const getNotificationIcon = (title: string) => {
    const lowerCaseTitle = title.toLowerCase();
    if (lowerCaseTitle.includes("job") || lowerCaseTitle.includes("assignment")) {
        return <Briefcase className="h-5 w-5 text-green-500" />;
    }
    if (lowerCaseTitle.includes("payment")) {
        return <Wallet className="h-5 w-5 text-blue-500" />;
    }
    if (lowerCaseTitle.includes("review")) {
        return <Star className="h-5 w-5 text-yellow-500" />;
    }
    if (lowerCaseTitle.includes("message")) {
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
    return <Bell className="h-5 w-5 text-gray-500" />;
};


const NotificationItem = ({ notification }: { notification: Notification }) => (
     <div className="flex items-start space-x-4 p-4 hover:bg-muted/50 rounded-lg">
        <div className="p-2 bg-muted rounded-full">
            {getNotificationIcon(notification.title)}
        </div>
        <div className="space-y-1 flex-1">
            <p className="font-medium">{notification.title}</p>
            <p className="text-sm text-muted-foreground">{notification.description}</p>
            <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true })}
            </p>
        </div>
        {!notification.read && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1" />}
    </div>
)

const NotificationItemSkeleton = () => (
    <div className="flex items-start space-x-4 p-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-3 w-3 rounded-full" />
    </div>
);

export default function WorkerNotificationsPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchNotifications = React.useCallback(async () => {
        if (user) {
            setLoading(true);
            try {
                const q = query(
                    collection(db, "notifications"),
                    where("userId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                const fetchedNotifications = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Notification));
                setNotifications(fetchedNotifications);
            } catch (error) {
                console.error("Error fetching notifications: ", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not load your notifications."
                });
            } finally {
                setLoading(false);
            }
        }
    }, [user, toast]);
    
    React.useEffect(() => {
        if (!authLoading) {
            fetchNotifications();
        }
    }, [authLoading, fetchNotifications]);


    const handleMarkAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length === 0) return;

        try {
            const batch = writeBatch(db);
            unreadIds.forEach(id => {
                const docRef = doc(db, "notifications", id);
                batch.update(docRef, { read: true });
            });
            await batch.commit();
            fetchNotifications(); // Refresh the list
            toast({ title: "Success", description: "All notifications marked as read." });
        } catch {
            toast({ variant: "destructive", title: "Error", description: "Could not mark notifications as read." });
        }
    };
    
    const unreadNotifications = notifications.filter(n => !n.read);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-muted-foreground">Stay updated on job invitations, messages, and more.</p>
                </div>
                <Button variant="outline" onClick={handleMarkAllAsRead} disabled={unreadNotifications.length === 0}>
                    <Archive className="mr-2 h-4 w-4" />
                    Mark all as read
                </Button>
            </div>

            <Card>
                <Tabs defaultValue="all">
                    <CardHeader className="border-b">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="all">All Notifications</TabsTrigger>
                            <TabsTrigger value="unread">Unread ({unreadNotifications.length})</TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent className="p-2">
                        <TabsContent value="all" className="m-0">
                           {loading ? (
                                Array.from({ length: 3 }).map((_, i) => <NotificationItemSkeleton key={i} />)
                           ) : notifications.length > 0 ? (
                               <div className="space-y-1">
                                    {notifications.map((item) => <NotificationItem key={item.id} notification={item}/>)}
                                </div>
                           ) : (
                                <div className="text-center text-muted-foreground py-12">
                                    <Bell className="mx-auto h-12 w-12" />
                                    <h3 className="mt-4 text-lg font-medium">No notifications yet</h3>
                                    <p className="mt-1 text-sm">We&apos;ll let you know when something new comes up.</p>
                                </div>
                           )}
                        </TabsContent>
                         <TabsContent value="unread" className="m-0">
                           {loading ? (
                                Array.from({ length: 1 }).map((_, i) => <NotificationItemSkeleton key={i} />)
                           ) : unreadNotifications.length > 0 ? (
                                <div className="space-y-1">
                                    {unreadNotifications.map((item) => <NotificationItem key={item.id} notification={item}/>)}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-12">
                                    <CheckCircle className="mx-auto h-12 w-12" />
                                    <h3 className="mt-4 text-lg font-medium">No unread notifications</h3>
                                    <p className="mt-1 text-sm">You&apos;re all caught up!</p>
                                </div>
                            )}
                        </TabsContent>
                    </CardContent>
                </Tabs>
            </Card>
        </div>
    )
}
