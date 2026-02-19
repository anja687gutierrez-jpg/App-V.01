/**
 * Community Feed Service — Firestore CRUD for posts & comments
 *
 * TODO: When project is upgraded to Blaze plan, enable Firebase Storage
 * for image uploads. Add back: ref, uploadBytes, getDownloadURL, deleteObject,
 * listAll from 'firebase/storage', and the imageFile param in createPost.
 */
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from './firebaseConfig';

export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  text: string;
  imageUrl?: string;
  route?: string;
  likes: string[];
  saves: string[];
  commentCount: number;
  createdAt: Timestamp;
}

export interface FeedComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Timestamp;
}

export const feedService = {
  subscribeFeed(
    callback: (posts: FeedPost[]) => void,
    limitCount = 50
  ): () => void {
    const feedRef = collection(db, 'feed');
    const q = query(feedRef, orderBy('createdAt', 'desc'), firestoreLimit(limitCount));
    return onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as FeedPost[];
      callback(posts);
    }, (error) => {
      console.error('[Feed] Subscription error:', error);
      callback([]);
    });
  },

  async createPost({
    text,
    route,
  }: {
    text: string;
    route?: string;
  }): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be signed in to post');

    const docRef = await addDoc(collection(db, 'feed'), {
      userId: user.uid,
      userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      userEmail: user.email || '',
      text,
      route: route || null,
      imageUrl: null,
      likes: [],
      saves: [],
      commentCount: 0,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  },

  async setLike(postId: string, liked: boolean): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;
    const postRef = doc(db, 'feed', postId);
    if (liked) {
      await updateDoc(postRef, { likes: arrayUnion(user.uid) });
    } else {
      await updateDoc(postRef, { likes: arrayRemove(user.uid) });
    }
  },

  async setSave(postId: string, saved: boolean): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;
    const postRef = doc(db, 'feed', postId);
    if (saved) {
      await updateDoc(postRef, { saves: arrayUnion(user.uid) });
    } else {
      await updateDoc(postRef, { saves: arrayRemove(user.uid) });
    }
  },

  async addComment(postId: string, text: string): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be signed in to comment');

    const commentsRef = collection(db, 'feed', postId, 'comments');
    const commentDoc = await addDoc(commentsRef, {
      userId: user.uid,
      userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      text,
      createdAt: serverTimestamp(),
    });

    const postRef = doc(db, 'feed', postId);
    await updateDoc(postRef, { commentCount: increment(1) });

    return commentDoc.id;
  },

  async getComments(postId: string): Promise<FeedComment[]> {
    const commentsRef = collection(db, 'feed', postId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as FeedComment[];
  },

  async deleteComment(postId: string, commentId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be signed in');

    await deleteDoc(doc(db, 'feed', postId, 'comments', commentId));
    await updateDoc(doc(db, 'feed', postId), { commentCount: increment(-1) });
  },

  async deletePost(postId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be signed in');

    // TODO: When Storage is enabled, also delete feed/{postId}/* files

    // Delete comments subcollection
    const commentsRef = collection(db, 'feed', postId, 'comments');
    const commentsSnap = await getDocs(commentsRef);
    await Promise.all(commentsSnap.docs.map((d) => deleteDoc(d.ref)));

    // Delete the post
    await deleteDoc(doc(db, 'feed', postId));
  },

  /**
   * Seed the feed with demo posts (call once to populate an empty feed).
   * These use free Pexels images as placeholder photos.
   */
  async seedDemoPosts(): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be signed in');

    const demoPosts = [
      {
        userName: 'Sarah M.',
        userEmail: 'sarah@demo.com',
        text: 'Just hit the most incredible viewpoint at Bixby Bridge! The fog rolling in made it absolutely magical. Highly recommend stopping here on your PCH drive.',
        imageUrl: 'https://images.pexels.com/photos/1604869/pexels-photo-1604869.jpeg?auto=compress&cs=tinysrgb&w=600',
        route: 'Pacific Coast Highway',
      },
      {
        userName: 'Mike R.',
        userEmail: 'mike@demo.com',
        text: 'Pro tip: the Buellton Supercharger has amazing tacos next door at El Rancho. Best charge stop food I\'ve found so far. 10/10 would charge again.',
        imageUrl: null,
        route: 'Supercharger Review',
      },
      {
        userName: 'Elena K.',
        userEmail: 'elena@demo.com',
        text: 'Completed the full Big Sur loop in my Model Y! Battery held up perfectly with just 2 charge stops. The coastal views are unreal.',
        imageUrl: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=600',
        route: 'Big Sur Loop',
      },
      {
        userName: 'Jordan T.',
        userEmail: 'jordan@demo.com',
        text: 'Sunrise at Joshua Tree after camping overnight. Charged up at Twentynine Palms beforehand — the desert sky at dawn is something else.',
        imageUrl: 'https://images.pexels.com/photos/2422265/pexels-photo-2422265.jpeg?auto=compress&cs=tinysrgb&w=600',
        route: 'Desert Explorer',
      },
      {
        userName: 'Priya S.',
        userEmail: 'priya@demo.com',
        text: 'Drove the 17-Mile Drive in Monterey today. Pebble Beach, Lone Cypress, and harbor seals — all in one afternoon. EV range was perfect for this loop!',
        imageUrl: 'https://images.pexels.com/photos/21014/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600',
        route: '17-Mile Drive',
      },
    ];

    for (const post of demoPosts) {
      await addDoc(collection(db, 'feed'), {
        userId: 'demo-user',
        userName: post.userName,
        userEmail: post.userEmail,
        text: post.text,
        imageUrl: post.imageUrl,
        route: post.route,
        likes: [],
        saves: [],
        commentCount: 0,
        createdAt: serverTimestamp(),
      });
    }
  },
};
