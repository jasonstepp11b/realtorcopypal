import { auth, db, storage, analytics } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  User,
  Auth,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  setDoc,
  increment,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Firestore } from "firebase/firestore";
import { FirebaseStorage } from "firebase/storage";
import { logEvent } from "firebase/analytics";

// Mock data storage for development without Firebase
const mockStorage: Record<string, any[]> = {
  savedListings: [],
  users: [],
};

// Auth functions
export const logoutUser = async () => {
  if (auth) {
    return (auth as Auth).signOut();
  }
  console.log("Mock logout");
  return Promise.resolve();
};

export const signInWithGoogle = async () => {
  if (!auth) {
    console.log("Firebase auth not configured. Using mock sign-in.");
    const mockUser = {
      uid: "mock-user-id",
      email: "mock-user@example.com",
      displayName: "Mock User",
    } as User;
    return mockUser;
  }

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth as Auth, provider);

    // Check if this is a new user and create a profile document if needed
    await createUserProfileIfNeeded(result.user);

    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string
) => {
  if (!auth) {
    console.log("Firebase auth not configured. Using mock sign-up.");
    const mockUser = {
      uid: `mock-user-${Date.now()}`,
      email,
      displayName,
    } as User;
    return mockUser;
  }

  try {
    const result = await createUserWithEmailAndPassword(
      auth as Auth,
      email,
      password
    );

    // Update the user's display name
    if (result.user) {
      await updateProfile(result.user, { displayName });

      // Send email verification
      await sendEmailVerification(result.user);

      // Create a user profile document
      await createUserProfileIfNeeded(result.user);
    }

    return result.user;
  } catch (error) {
    console.error("Error signing up with email", error);
    throw error;
  }
};

export const signInWithEmailAndPassword = async (
  email: string,
  password: string
) => {
  if (!auth) {
    console.log("Firebase auth not configured. Using mock sign-in.");
    const mockUser = {
      uid: "mock-user-id",
      email,
      displayName: "Mock User",
    } as User;
    return mockUser;
  }

  try {
    const result = await firebaseSignInWithEmailAndPassword(
      auth as Auth,
      email,
      password
    );
    return result.user;
  } catch (error) {
    console.error("Error signing in with email", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  if (!auth) {
    console.log("Firebase auth not configured. Mock password reset.");
    return Promise.resolve();
  }

  try {
    await sendPasswordResetEmail(auth as Auth, email);
  } catch (error) {
    console.error("Error sending password reset email", error);
    throw error;
  }
};

// User profile functions
export const createUserProfileIfNeeded = async (user: User) => {
  if (!db || !user) return;

  try {
    // Check if the user profile already exists
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create a new user profile document
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now(),
        generationCount: 0,
        subscription: {
          plan: "free",
          startDate: Timestamp.now(),
          endDate: null,
        },
      });
      console.log("User profile created for", user.uid);
    } else {
      // Update the last login time
      await updateDoc(userRef, {
        lastLogin: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error("Error creating user profile", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  if (!db) {
    console.log(`Mock getting user profile for ${userId}`);
    return {
      id: userId,
      email: "mock-user@example.com",
      displayName: "Mock User",
      generationCount: 0,
      subscription: {
        plan: "free",
        startDate: new Date().toISOString(),
        endDate: null,
      },
    };
  }

  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile", error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: any) => {
  if (!db) {
    console.log(`Mock updating user profile for ${userId}:`, data);
    return;
  }

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, data);
  } catch (error) {
    console.error("Error updating user profile", error);
    throw error;
  }
};

// Firestore functions
export const addDocument = async (collectionName: string, data: any) => {
  if (!db) {
    console.log(`Mock adding document to ${collectionName}:`, data);
    const id = `mock-id-${Date.now()}`;
    const newDoc = { id, ...data, createdAt: new Date().toISOString() };
    mockStorage[collectionName] = mockStorage[collectionName] || [];
    mockStorage[collectionName].push(newDoc);
    return { id };
  }

  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error(`Error adding document to ${collectionName}`, error);
    throw error;
  }
};

export const getDocuments = async (collectionName: string, userId?: string) => {
  if (!db) {
    console.log(`Mock getting documents from ${collectionName}`);
    const docs = mockStorage[collectionName] || [];
    if (userId) {
      return docs.filter((doc) => doc.userId === userId);
    }
    return docs;
  }

  try {
    let q;
    if (userId) {
      q = query(
        collection(db, collectionName),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}`, error);
    throw error;
  }
};

export const updateDocument = async (
  collectionName: string,
  id: string,
  data: any
) => {
  if (!db) {
    console.log(`Mock updating document in ${collectionName}:`, id, data);
    mockStorage[collectionName] = mockStorage[collectionName] || [];
    const index = mockStorage[collectionName].findIndex((doc) => doc.id === id);
    if (index !== -1) {
      mockStorage[collectionName][index] = {
        ...mockStorage[collectionName][index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
    }
    return;
  }

  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error(`Error updating document in ${collectionName}`, error);
    throw error;
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  if (!db) {
    console.log(`Mock deleting document from ${collectionName}:`, id);
    mockStorage[collectionName] = mockStorage[collectionName] || [];
    mockStorage[collectionName] = mockStorage[collectionName].filter(
      (doc) => doc.id !== id
    );
    return;
  }

  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}`, error);
    throw error;
  }
};

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  if (!storage) {
    console.log(`Mock uploading file to ${path}`);
    return `https://mock-storage-url.com/${path}`;
  }

  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error(`Error uploading file to ${path}`, error);
    throw error;
  }
};

// Increment user's generation count
export const incrementGenerationCount = async (userId: string) => {
  if (!db) {
    console.log(`Mock incrementing generation count for user ${userId}`);
    return;
  }

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      generationCount: increment(1),
    });
  } catch (error) {
    console.error("Error incrementing generation count", error);
  }
};

// Add a new function to check email verification status
export const isEmailVerified = (user: User | null): boolean => {
  return user?.emailVerified || false;
};

// Add a function to resend verification email
export const resendVerificationEmail = async (user: User): Promise<void> => {
  if (!auth) {
    console.log("Firebase auth not configured. Mock resend verification.");
    return Promise.resolve();
  }

  try {
    await sendEmailVerification(user);
  } catch (error) {
    console.error("Error sending verification email", error);
    throw error;
  }
};

// Function to save generated content
export const saveGeneratedContent = async (
  userId: string,
  contentType: string,
  content: string,
  metadata: any
) => {
  if (!db) {
    console.log(`Mock saving generated content for user ${userId}`);
    const id = `mock-id-${Date.now()}`;
    return { id };
  }

  try {
    // Increment the user's generation count
    await incrementGenerationCount(userId);

    // Add the content to the listings collection
    const docRef = await addDoc(collection(db, "listings"), {
      userId,
      type: contentType, // "property-listing", "social-media", or "email-campaign"
      content,
      ...metadata,
      createdAt: Timestamp.now(),
    });

    return { id: docRef.id };
  } catch (error) {
    console.error("Error saving generated content", error);
    throw error;
  }
};

// Define plan limits
const PLAN_LIMITS = {
  free: 5,
  starter: 50,
  professional: 200,
  team: 1000,
};

// Function to check if user has exceeded their generation limit
export const checkUsageLimit = async (
  userId: string
): Promise<{
  canGenerate: boolean;
  currentUsage: number;
  limit: number;
  percentUsed: number;
}> => {
  if (!db) {
    console.log(`Mock checking usage limit for user ${userId}`);
    return {
      canGenerate: true,
      currentUsage: 0,
      limit: PLAN_LIMITS.free,
      percentUsed: 0,
    };
  }

  try {
    // Get the user's profile
    const userProfile = await getUserProfile(userId);

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    // Get the user's subscription plan and generation count
    const plan = userProfile.subscription?.plan || "free";
    const generationCount = userProfile.generationCount || 0;

    // Get the limit for the user's plan
    const limit =
      PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;

    // Calculate percentage used
    const percentUsed = Math.min(
      Math.round((generationCount / limit) * 100),
      100
    );

    return {
      canGenerate: generationCount < limit,
      currentUsage: generationCount,
      limit,
      percentUsed,
    };
  } catch (error) {
    console.error("Error checking usage limit", error);
    throw error;
  }
};

// Function to track analytics events
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (!analytics) {
    console.log(`Mock tracking event: ${eventName}`, eventParams);
    return;
  }

  try {
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.error(`Error tracking event ${eventName}:`, error);
  }
};
