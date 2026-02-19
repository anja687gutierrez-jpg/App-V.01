import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Plus,
  ImagePlus,
  Send,
  Trash2,
  Loader2,
  Users,
  MapPin,
  ChevronDown,
  ChevronUp,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { feedService, type FeedPost, type FeedComment } from '@/lib/feedService';
import { isModerator } from '@/lib/featureFlags';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';

function timeAgo(ts: Timestamp | null | undefined): string {
  if (!ts) return 'just now';
  const now = Date.now();
  const then = ts.toMillis();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function PostCard({
  post,
  currentUserId,
  isMod,
  onDelete,
}: {
  post: FeedPost;
  currentUserId: string;
  isMod: boolean;
  onDelete: (id: string) => void;
}) {
  const [liked, setLiked] = useState(post.likes.includes(currentUserId));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [saved, setSaved] = useState(post.saves.includes(currentUserId));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const { toast } = useToast();

  // Sync with real-time updates
  useEffect(() => {
    setLiked(post.likes.includes(currentUserId));
    setLikeCount(post.likes.length);
    setSaved(post.saves.includes(currentUserId));
  }, [post.likes, post.saves, currentUserId]);

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => (newLiked ? c + 1 : c - 1));
    try {
      await feedService.setLike(post.id, newLiked);
    } catch {
      setLiked(!newLiked);
      setLikeCount((c) => (newLiked ? c - 1 : c + 1));
    }
  };

  const handleSave = async () => {
    const newSaved = !saved;
    setSaved(newSaved);
    try {
      await feedService.setSave(post.id, newSaved);
    } catch {
      setSaved(!newSaved);
    }
  };

  const loadComments = async () => {
    if (!showComments) {
      setShowComments(true);
      setLoadingComments(true);
      try {
        const data = await feedService.getComments(post.id);
        setComments(data);
      } catch {
        toast({ title: 'Failed to load comments', variant: 'destructive' });
      } finally {
        setLoadingComments(false);
      }
    } else {
      setShowComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await feedService.addComment(post.id, commentText.trim());
      setCommentText('');
      const data = await feedService.getComments(post.id);
      setComments(data);
    } catch {
      toast({ title: 'Failed to add comment', variant: 'destructive' });
    } finally {
      setSubmittingComment(false);
    }
  };

  const isOwner = post.userId === currentUserId;
  const canDelete = isOwner || isMod;
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.userEmail || post.userName)}`;

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <img
            src={avatarUrl}
            alt={post.userName}
            className="w-9 h-9 rounded-full border border-slate-200"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">{post.userName}</span>
              <span className="text-xs text-slate-400">{timeAgo(post.createdAt)}</span>
            </div>
            {post.route && (
              <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {post.route}
              </span>
            )}
          </div>
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-red-500"
              onClick={() => onDelete(post.id)}
              title={isOwner ? 'Delete your post' : 'Delete post (moderator)'}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Post text */}
        <p className="text-sm text-slate-700 leading-relaxed mb-3">{post.text}</p>

        {/* Image */}
        {post.imageUrl && (
          <div className="rounded-lg overflow-hidden mb-3">
            <img
              src={post.imageUrl}
              alt=""
              className="w-full max-h-80 object-cover"
            />
          </div>
        )}

        {/* Interactions */}
        <div className="flex items-center gap-4 text-sm text-slate-500 border-t border-slate-100 pt-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors ${
              liked ? 'text-red-500 font-semibold' : 'hover:text-red-500'
            }`}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            {likeCount}
          </button>
          <button
            onClick={loadComments}
            className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            {post.commentCount}
            {showComments ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 ml-auto transition-colors ${
              saved ? 'text-yellow-500 font-semibold' : 'hover:text-yellow-500'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
            {loadingComments ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              </div>
            ) : (
              <>
                {comments.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">No comments yet</p>
                )}
                {comments.map((c) => {
                  const canDeleteComment = c.userId === currentUserId || isMod;
                  return (
                    <div key={c.id} className="flex gap-2 group">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.userName)}`}
                        alt=""
                        className="w-6 h-6 rounded-full border border-slate-200 flex-shrink-0 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-slate-700">{c.userName}</span>
                        <span className="text-xs text-slate-400 ml-2">{timeAgo(c.createdAt)}</span>
                        <p className="text-sm text-slate-600">{c.text}</p>
                      </div>
                      {canDeleteComment && (
                        <button
                          onClick={async () => {
                            try {
                              await feedService.deleteComment(post.id, c.id);
                              setComments((prev) => prev.filter((x) => x.id !== c.id));
                            } catch {
                              toast({ title: 'Failed to delete comment', variant: 'destructive' });
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 flex-shrink-0 mt-0.5"
                          title={c.userId === currentUserId ? 'Delete your comment' : 'Delete comment (moderator)'}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </>
            )}
            {/* Add comment */}
            <div className="flex gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="text-sm h-9"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <Button
                size="sm"
                className="h-9 px-3"
                onClick={handleAddComment}
                disabled={!commentText.trim() || submittingComment}
              >
                {submittingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CommunityFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Create post form state
  const [newText, setNewText] = useState('');
  const [newRoute, setNewRoute] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const unsubscribe = feedService.subscribeFeed((data) => {
      setPosts(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleCreatePost = async () => {
    if (!newText.trim()) return;
    setCreating(true);
    try {
      await feedService.createPost({
        text: newText.trim(),
        route: newRoute.trim() || undefined,
      });
      setNewText('');
      setNewRoute('');
      setDialogOpen(false);
      toast({ title: 'Post created!' });
    } catch (error) {
      toast({ title: 'Failed to create post', variant: 'destructive' });
      console.error('[CommunityFeed] Create error:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await feedService.deletePost(postId);
      toast({ title: 'Post deleted' });
    } catch {
      toast({ title: 'Failed to delete post', variant: 'destructive' });
    }
  };

  const currentUserId = user?.uid || '';
  const userIsMod = isModerator(user?.email);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 px-1 sm:px-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-blue-600" /> Community
            {userIsMod && (
              <Badge variant="outline" className="ml-1 text-xs font-medium border-amber-300 text-amber-700 bg-amber-50 gap-1">
                <Shield className="h-3 w-3" /> Mod
              </Badge>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Share your road trip moments</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Post</DialogTitle>
              <DialogDescription>Share a moment from your journey</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <Textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="What's happening on your trip?"
                rows={4}
                className="resize-none"
              />

              <Input
                value={newRoute}
                onChange={(e) => setNewRoute(e.target.value)}
                placeholder="Tag a route (optional)"
                className="text-sm"
              />

              {/* TODO: Enable image uploads when project is upgraded to Blaze plan (Firebase Storage) */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <ImagePlus className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-500">Photo uploads coming soon</span>
              </div>

              <Button
                onClick={handleCreatePost}
                disabled={!newText.trim() || creating}
                className="w-full"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Posting...
                  </>
                ) : (
                  'Post'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Posting Guidelines */}
      <Card className="bg-blue-50/60 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800 space-y-1">
              <p className="font-semibold text-sm">Community Guidelines</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-700">
                <li>Be respectful and supportive of fellow road trippers</li>
                <li>Stay on topic — road trips, EVs, routes, and travel tips</li>
                <li>No spam, self-promotion, or repeated posts</li>
                <li>Don't share personal info (phone numbers, addresses)</li>
                <li>Only share photos you own or have permission to use</li>
              </ul>
              <p className="text-blue-600 italic">Posts that violate these guidelines may be removed by moderators.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                    <div className="h-2.5 w-16 bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
                <div className="h-32 w-full bg-slate-100 rounded-lg animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No posts yet</h3>
            <p className="text-sm text-slate-500 mb-4">
              Be the first to share something from your road trip!
            </p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Create First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              isMod={userIsMod}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
