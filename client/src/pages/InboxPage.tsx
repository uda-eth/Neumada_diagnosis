import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useUser } from '@/hooks/use-user';
import { useMessages, Conversation, useMessageNotifications } from '@/hooks/use-messages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { MessageSquare, Search, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function InboxPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const { user } = useUser();
  const { conversations, loading, error, fetchConversations, markAllAsRead, connectSocket } = useMessages();
  const { showNotification } = useMessageNotifications();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user?.id) {
      fetchConversations(user.id);
      connectSocket(user.id);
    }
  }, [user, fetchConversations, connectSocket]);
  
  // Listen for new message events
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const message = event.detail;
      showNotification(message);
      // Refresh conversations when receiving a new message
      if (user?.id) {
        fetchConversations(user.id);
      }
    };
    
    // Add event listener for new message notifications
    document.addEventListener('new-message', handleNewMessage as EventListener);
    
    // Clean up
    return () => {
      document.removeEventListener('new-message', handleNewMessage as EventListener);
    };
  }, [showNotification, fetchConversations, user]);

  useEffect(() => {
    setFilteredConversations(
      conversations.filter(
        (conv) =>
          conv.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [conversations, searchTerm]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleMarkAllAsRead = () => {
    if (user?.id) {
      markAllAsRead(user.id);
    }
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return format(date, 'h:mm a'); // Today: show time only
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return format(date, 'EEEE'); // Show day of week
    } else {
      return format(date, 'MMM d'); // Show month and day
    }
  };

  if (!user) {
    return (
      <div className="container max-w-4xl py-8 mx-auto">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">You need to sign in</h3>
              <p className="text-sm text-gray-500 mt-2">Sign in to view your messages</p>
              <Button
                className="mt-4"
                onClick={() => setLocation('/login')}
              >
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unreadCount = conversations.reduce(
    (count, conv) => count + (conv.unreadCount || 0),
    0
  );

  return (
    <div className="container max-w-4xl py-8 mx-auto">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex flex-col space-y-1.5">
            <CardTitle className="flex items-center">
              Messages
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-primary">{unreadCount}</Badge>
              )}
            </CardTitle>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </CardHeader>
        <div className="px-6 pb-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-8 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading conversations: {error}</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              {searchTerm ? (
                <>
                  <XCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium">No results found</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    No conversations match your search
                  </p>
                  <Button variant="outline" className="mt-4" onClick={clearSearch}>
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium">No conversations yet</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Connect with others to start messaging
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setLocation('/connect')}
                  >
                    Find connections
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation, index) => (
                <React.Fragment key={conversation.user.id}>
                  <Link href={`/chat/${conversation.user.id}`}>
                    <div className="flex items-start p-3 hover:bg-muted rounded-md cursor-pointer">
                      <Avatar className="h-12 w-12 mr-4 flex-shrink-0">
                        <AvatarImage src={conversation.user.image || undefined} alt={conversation.user.name || 'User'} />
                        <AvatarFallback>
                          {conversation.user.name?.[0] || conversation.user.username?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">
                            {conversation.user.name || conversation.user.username || 'User'}
                          </h4>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {formatMessageDate(conversation.lastMessage.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-muted-foreground truncate max-w-[220px] sm:max-w-[300px] md:max-w-[400px]">
                            {user.id === conversation.lastMessage.senderId && (
                              <span className="text-xs text-muted-foreground mr-1">You:</span>
                            )}
                            {conversation.lastMessage.content}
                          </p>
                          {(conversation.unreadCount || 0) > 0 && (
                            <Badge className="ml-2 bg-primary" variant="default">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                  {index < filteredConversations.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}