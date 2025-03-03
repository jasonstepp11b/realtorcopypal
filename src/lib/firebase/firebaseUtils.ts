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

// Auth functions
export const logoutUser = async () => {
  return auth.signOut();
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

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
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

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
  try {
    const result = await firebaseSignInWithEmailAndPassword(
      auth,
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
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email", error);
    throw error;
  }
};

// User profile functions
export const createUserProfileIfNeeded = async (user: User) => {
  if (!user) return;

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
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

export const getDocuments = async (collectionName: string, userId?: string) => {
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
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return { id };
  } catch (error) {
    console.error(`Error updating document in ${collectionName}`, error);
    throw error;
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
    return { success: true };
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}`, error);
    throw error;
  }
};

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error(`Error uploading file to ${path}`, error);
    throw error;
  }
};

export const incrementGenerationCount = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      generationCount: increment(1),
    });
  } catch (error) {
    console.error("Error incrementing generation count", error);
    throw error;
  }
};

export const isEmailVerified = (user: User | null): boolean => {
  return user?.emailVerified || false;
};

export const resendVerificationEmail = async (user: User): Promise<void> => {
  try {
    await sendEmailVerification(user);
  } catch (error) {
    console.error("Error sending verification email", error);
    throw error;
  }
};

export const saveGeneratedContent = async (
  userId: string,
  contentType: string,
  content: string,
  metadata: any
) => {
  try {
    // First increment the user's generation count
    await incrementGenerationCount(userId);

    // Then save the generated content
    const docRef = await addDoc(collection(db, "generated-content"), {
      userId,
      contentType,
      content,
      metadata,
      createdAt: Timestamp.now(),
    });

    return { id: docRef.id };
  } catch (error) {
    console.error("Error saving generated content", error);
    throw error;
  }
};

export const checkUsageLimit = async (
  userId: string
): Promise<{
  canGenerate: boolean;
  currentUsage: number;
  limit: number;
  percentUsed: number;
}> => {
  try {
    // Get the user profile to check their subscription plan
    const userProfile = await getUserProfile(userId);

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    // Define the user profile type
    interface UserProfile {
      id: string;
      subscription?: {
        plan?: string;
      };
      generationCount?: number;
      [key: string]: any;
    }

    // Cast the userProfile to the defined type
    const typedProfile = userProfile as UserProfile;

    // Default limits based on subscription plan
    let limit = 5; // Free plan default

    if (typedProfile.subscription && typedProfile.subscription.plan) {
      switch (typedProfile.subscription.plan) {
        case "basic":
          limit = 25;
          break;
        case "premium":
          limit = 100;
          break;
        case "unlimited":
          limit = Infinity;
          break;
        default:
          limit = 5; // Free plan
      }
    }

    const currentUsage = typedProfile.generationCount || 0;
    const percentUsed = limit === Infinity ? 0 : (currentUsage / limit) * 100;
    const canGenerate = currentUsage < limit;

    return {
      canGenerate,
      currentUsage,
      limit,
      percentUsed,
    };
  } catch (error) {
    console.error("Error checking usage limit", error);
    throw error;
  }
};

export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (analytics) {
    try {
      logEvent(analytics, eventName, eventParams);
    } catch (error) {
      console.error(`Error tracking event ${eventName}:`, error);
    }
  }
};

export const getGeneratedContent = async (
  userId: string,
  contentType?: string
) => {
  try {
    console.log(
      "getGeneratedContent called with userId:",
      userId,
      "contentType:",
      contentType
    );
    let q;

    if (contentType) {
      // If contentType is provided, filter by both userId and contentType
      console.log("Creating query with userId and contentType filters");
      q = query(
        collection(db, "generated-content"),
        where("userId", "==", userId),
        where("contentType", "==", contentType),
        orderBy("createdAt", "desc")
      );
    } else {
      // If no contentType is provided, just filter by userId
      console.log("Creating query with only userId filter");
      q = query(
        collection(db, "generated-content"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
    }

    console.log("Executing Firestore query...");
    const querySnapshot = await getDocs(q);
    console.log("Query returned", querySnapshot.size, "documents");

    const results = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(), // Convert Firestore Timestamp to JS Date
      };
    });

    console.log("Processed results:", results);
    return results;
  } catch (error) {
    console.error("Error in getGeneratedContent:", error);
    throw error;
  }
};
