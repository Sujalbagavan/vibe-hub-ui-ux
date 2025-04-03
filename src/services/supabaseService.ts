
import { supabase } from "@/integrations/supabase/client";
import { 
  EventRow, EventInsert, CommentInsert, AttendeeInsert, 
  VolunteerRoleInsert, EventVolunteerInsert, AIChatInsert
} from "@/types/supabase";

// Events
export const getEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getEventById = async (id: string) => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      event_attendees(*),
      volunteer_roles(*),
      event_volunteers(*),
      event_comments(*, profiles:user_id(*))
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createEvent = async (event: EventInsert) => {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateEvent = async (id: string, updates: Partial<EventRow>) => {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteEvent = async (id: string) => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// Attendees
export const joinEvent = async (eventId: string, userId: string) => {
  const attendee: AttendeeInsert = {
    event_id: eventId,
    user_id: userId
  };
  
  const { data, error } = await supabase
    .from('event_attendees')
    .insert(attendee)
    .select()
    .single();
  
  if (error) throw error;
  
  // Update spots remaining
  const { data: event } = await supabase
    .from('events')
    .select('spots_remaining')
    .eq('id', eventId)
    .single();
  
  if (event && event.spots_remaining !== null) {
    await supabase
      .from('events')
      .update({ spots_remaining: event.spots_remaining - 1 })
      .eq('id', eventId);
  }
  
  return data;
};

// Comments
export const addComment = async (eventId: string, userId: string, content: string) => {
  const comment: CommentInsert = {
    event_id: eventId,
    user_id: userId,
    content
  };
  
  const { data, error } = await supabase
    .from('event_comments')
    .insert(comment)
    .select(`*, profiles:user_id(*)`)
    .single();
  
  if (error) throw error;
  return data;
};

// Volunteer roles and volunteering
export const volunteerForRole = async (eventId: string, roleId: string, userId: string) => {
  const volunteer: EventVolunteerInsert = {
    event_id: eventId,
    role_id: roleId,
    user_id: userId
  };
  
  const { data, error } = await supabase
    .from('event_volunteers')
    .insert(volunteer)
    .select()
    .single();
  
  if (error) throw error;
  
  // Update spots filled
  const { data: role } = await supabase
    .from('volunteer_roles')
    .select('spots_filled')
    .eq('id', roleId)
    .single();
  
  if (role) {
    await supabase
      .from('volunteer_roles')
      .update({ spots_filled: role.spots_filled + 1 })
      .eq('id', roleId);
  }
  
  return data;
};

// AI Chat
export const saveChatMessage = async (userId: string, message: string, response: string) => {
  const chatMessage: AIChatInsert = {
    user_id: userId,
    message,
    response
  };
  
  const { data, error } = await supabase
    .from('ai_chat_messages')
    .insert(chatMessage)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getChatHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('ai_chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
};

// Auth
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
