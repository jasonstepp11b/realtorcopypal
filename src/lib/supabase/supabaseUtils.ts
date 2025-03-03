import { supabase } from "./supabase";
import { User, Session } from "@supabase/supabase-js";

// Types
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  content: string;
  type: string;
  title?: string;
  created_at: string;
  project_id?: string;
}

export interface PropertyProject {
  id: string;
  user_id: string;
  name: string;
  address: string;
  property_type: string;
  bedrooms: string;
  bathrooms: string;
  square_feet: string;
  listing_price: string;
  features: string;
  selling_points: string;
  target_buyer: string;
  neighborhood_highlights: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
}

// Project Content Types
export interface ProjectContent {
  id: string;
  project_id: string;
  user_id: string;
  content_type: "property-listing" | "social-media" | "email-campaign";
  content: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

// Auth functions
export const logoutUser = async () => {
  return supabase.auth.signOut();
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  fullName: string
) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;

    // Create a user profile if signup was successful
    if (data.user) {
      await createUserProfile(data.user.id, {
        email,
        full_name: fullName,
      });
    }

    return data;
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error signing in with email", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error resetting password", error);
    throw error;
  }
};

export const updateUserPassword = async (password: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error updating password", error);
    throw error;
  }
};

// User profile functions
export const createUserProfile = async (
  userId: string,
  userData: Partial<UserProfile>
) => {
  try {
    // First try to get the profile - it might already exist due to the trigger
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    // If profile exists, just return
    if (existingProfile) {
      return;
    }

    // If not, try to create it
    const { error } = await supabase
      .from("profiles")
      .insert([
        {
          id: userId,
          ...userData,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating user profile:", error);

      // If we get an RLS error, try using a function instead
      if (error.message.includes("row-level security policy")) {
        // This is a fallback approach - ideally the trigger should handle this
        const { error: functionError } = await supabase.rpc("create_profile", {
          user_id: userId,
          user_email: userData.email || "",
          user_name: userData.full_name || "",
        });

        if (functionError) throw functionError;
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("Error creating user profile", error);
    // Don't throw here - we want signup to succeed even if profile creation fails
    // The trigger should handle profile creation
  }
};

export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting user profile", error);
    return null;
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
) => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating user profile", error);
    throw error;
  }
};

// Project functions
export const addProject = async (projectData: Partial<PropertyProject>) => {
  try {
    const { data, error } = await supabase
      .from("property_projects")
      .insert([projectData])
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error("Error adding project:", error);
    throw error;
  }
};

export const getProjects = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("property_projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting projects:", error);
    throw error;
  }
};

export const getProject = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("property_projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting project:", error);
    throw error;
  }
};

export const updateProject = async (
  id: string,
  updates: Partial<PropertyProject>
) => {
  try {
    const { data, error } = await supabase
      .from("property_projects")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

export const deleteProject = async (id: string) => {
  try {
    // First delete all project content
    await deleteAllProjectContent(id);

    // Then delete the project
    const { error } = await supabase
      .from("property_projects")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

// Project Content functions
export const saveProjectContent = async (
  projectId: string,
  userId: string,
  contentType: "property-listing" | "social-media" | "email-campaign",
  content: string,
  metadata?: any
) => {
  try {
    console.log("Saving project content:", {
      projectId,
      userId,
      contentType,
      contentLength: content.length,
      metadataProvided: !!metadata,
    });

    // Validate inputs
    if (!projectId) {
      throw new Error("Cannot save project content: projectId is missing");
    }

    if (!userId) {
      throw new Error("Cannot save project content: userId is missing");
    }

    // Check if content is too large
    if (content.length > 500000) {
      console.warn("Content is very large, truncating to 500,000 characters");
      content = content.substring(0, 500000);
    }

    // Create the content object
    const contentData = {
      project_id: projectId,
      user_id: userId,
      content_type: contentType,
      content,
      metadata: metadata ? JSON.stringify(metadata) : null,
    };

    const { data, error } = await supabase
      .from("project_content")
      .insert([contentData])
      .select();

    if (error) {
      console.error("Supabase error saving project content:", error);
      throw error;
    }

    if (!data?.[0]) {
      throw new Error("No data returned after saving content");
    }

    console.log("Project content saved successfully:", data[0].id);
    return data[0];
  } catch (error) {
    console.error("Error saving project content:", error);
    throw error;
  }
};

export const getProjectContent = async (
  projectId: string,
  contentType?: "property-listing" | "social-media" | "email-campaign"
) => {
  try {
    console.log(
      "Getting content for project:",
      projectId,
      "type:",
      contentType
    );

    let query = supabase
      .from("project_content")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (contentType) {
      query = query.eq("content_type", contentType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error getting project content:", error);
      throw error;
    }

    // Process the data to handle metadata
    const processedData = data?.map((item) => {
      try {
        // If there's metadata, try to parse it
        if (item.metadata && typeof item.metadata === "string") {
          try {
            const parsedMetadata = JSON.parse(item.metadata);
            // Add parsed metadata to the item for easier access
            return {
              ...item,
              parsedMetadata,
            };
          } catch (parseError) {
            console.warn(
              "Failed to parse metadata for item:",
              item.id,
              parseError
            );
            // Keep the original item if parsing fails
            return {
              ...item,
              parsedMetadata: null,
            };
          }
        }
        return item;
      } catch (itemError) {
        console.error("Error processing item:", item.id, itemError);
        return item;
      }
    });

    console.log(
      "Successfully fetched project content:",
      processedData?.length || 0,
      "items"
    );
    return processedData;
  } catch (error) {
    console.error("Error getting project content:", error);
    return [];
  }
};

export const deleteProjectContent = async (id: string) => {
  try {
    const { error } = await supabase
      .from("project_content")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting project content:", error);
    throw error;
  }
};

export const deleteAllProjectContent = async (projectId: string) => {
  try {
    const { error } = await supabase
      .from("project_content")
      .delete()
      .eq("project_id", projectId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting all project content:", error);
    throw error;
  }
};

// Legacy Content generation functions
export const saveGeneration = async (
  userId: string,
  content: string,
  type: string,
  metadata?: string,
  projectId?: string
) => {
  try {
    console.log("Saving generation with:", {
      userId,
      type,
      contentLength: content.length,
      projectId,
    });

    // Check if content is too large (PostgreSQL TEXT has a limit of ~1GB, but let's be conservative)
    if (content.length > 500000) {
      console.warn("Content is very large, truncating to 500,000 characters");
      content = content.substring(0, 500000);
    }

    // Ensure metadata is not too large
    let titleValue = metadata;
    if (metadata && metadata.length > 5000) {
      console.warn("Metadata is very large, truncating to 5,000 characters");
      titleValue = metadata.substring(0, 5000);
    }

    // Create the generation object
    const generationData = {
      user_id: userId,
      content,
      type,
      title: titleValue,
      project_id: projectId,
    };

    console.log("Inserting generation:", {
      user_id: userId,
      type,
      title_length: titleValue?.length || 0,
      project_id: projectId,
    });

    const { data, error } = await supabase
      .from("generations")
      .insert([generationData])
      .select();

    if (error) {
      console.error("Supabase error saving generation:", error);

      // Check for specific error types
      if (error.code === "42501") {
        console.error("Permission denied error - likely an RLS policy issue");
      } else if (error.code === "23505") {
        console.error("Unique constraint violation");
      }

      throw error;
    }

    console.log("Generation saved successfully:", data?.[0]?.id);
    return data?.[0];
  } catch (error) {
    console.error("Error saving generation:", error);
    throw error;
  }
};

export const getGenerations = async (userId: string, type?: string) => {
  try {
    console.log("Getting generations for user:", userId, "type:", type);

    let query = supabase
      .from("generations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error getting generations:", error);
      throw error;
    }

    // Process the data to handle metadata
    const processedData = data?.map((item) => {
      try {
        // If there's title metadata, try to parse it
        if (item.title && typeof item.title === "string") {
          try {
            const metadata = JSON.parse(item.title);
            // Add parsed metadata to the item for easier access
            return {
              ...item,
              parsedMetadata: metadata,
            };
          } catch (parseError) {
            console.warn(
              "Failed to parse metadata for item:",
              item.id,
              parseError
            );
            // Keep the original item if parsing fails
            return {
              ...item,
              parsedMetadata: null,
            };
          }
        }
        return item;
      } catch (itemError) {
        console.error("Error processing item:", item.id, itemError);
        return item;
      }
    });

    console.log(
      "Successfully fetched generations:",
      processedData?.length || 0,
      "items"
    );
    return processedData;
  } catch (error) {
    console.error("Error getting generations:", error);
    return [];
  }
};

export const deleteGeneration = async (id: string) => {
  try {
    const { error } = await supabase.from("generations").delete().eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting generation", error);
    throw error;
  }
};

// Storage functions
export const uploadFile = async (bucket: string, path: string, file: File) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error uploading file", error);
    throw error;
  }
};

export const getFileUrl = async (bucket: string, path: string) => {
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.error("Error getting file URL", error);
    throw error;
  }
};

// Analytics function (simplified)
export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  // You can integrate with a third-party analytics service here
  // For now, just log to console
  console.log(`[Analytics] ${eventName}`, properties);
};
