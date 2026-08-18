import { supabase } from "@/integrations/supabase/client";
import { Feedback, Comment, Profile, Category, Notification } from "./types";

/**
 * Funções de serviço para a Central de Feedback SOS01
 */

// --- PERFIL ---
export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('display_name', username)
    .single();
  
  if (error) return null;
  return data as Profile;
}

export async function getProfileById(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) return null;
  return data as Profile;
}

// --- CATEGORIAS ---
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('community_categories')
    .select('*')
    .order('name');
  
  if (error) return [];
  return data as Category[];
}

// --- FEEDBACKS ---
export async function getPosts(options: { 
  categoryId?: string, 
  userId?: string, 
  followingOnly?: boolean,
  limit?: number,
  offset?: number,
  trending?: boolean
} = {}): Promise<Feedback[]> {
  const { categoryId, userId, limit = 10, offset = 0, trending } = options;
  
  let query = supabase
    .from('community_posts')
    .select(`
      *,
      profiles:user_id (avatar_url, display_name, id),
      community_categories:category_id (name, slug, icon)
    `);

  if (categoryId) query = query.eq('category_id', categoryId);
  if (userId) query = query.eq('user_id', userId);
  
  if (trending) {
    query = query.order('likes_count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query.range(offset, offset + limit - 1);
  
  if (error) {
    console.error("Error fetching feedbacks:", error);
    return [];
  }
  return data as unknown as Feedback[];
}

export async function createPost(content: string, imageUrl?: string, categoryId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      user_id: user.id,
      content,
      image_url: imageUrl,
      category_id: categoryId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleLike(postId: string, isLiked: boolean) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  if (isLiked) {
    const { error } = await supabase
      .from('community_post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('community_post_likes')
      .insert({
        post_id: postId,
        user_id: user.id
      });
    if (error) throw error;
  }
}

// --- COMENTÁRIOS ---
export async function getComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('community_comments')
    .select(`
      *,
      profiles:user_id (avatar_url, display_name, id)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data as unknown as Comment[];
}

export async function addComment(postId: string, content: string, parentId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await supabase
    .from('community_comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      content,
      parent_id: parentId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
