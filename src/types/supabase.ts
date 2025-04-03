
import { Database } from "@/integrations/supabase/types";

// Type-safe database types
export type Tables = Database['public']['Tables'];
export type EventRow = Tables['events']['Row'];
export type EventInsert = Tables['events']['Insert'];
export type EventUpdate = Tables['events']['Update'];

export type AttendeeRow = Tables['event_attendees']['Row'];
export type AttendeeInsert = Tables['event_attendees']['Insert'];

export type VolunteerRoleRow = Tables['volunteer_roles']['Row'];
export type VolunteerRoleInsert = Tables['volunteer_roles']['Insert'];
export type VolunteerRoleUpdate = Tables['volunteer_roles']['Update'];

export type EventVolunteerRow = Tables['event_volunteers']['Row'];
export type EventVolunteerInsert = Tables['event_volunteers']['Insert'];

export type CommentRow = Tables['event_comments']['Row'];
export type CommentInsert = Tables['event_comments']['Insert'];

export type ProfileRow = Tables['profiles']['Row'];
export type ProfileUpdate = Tables['profiles']['Update'];

export type AIChatRow = Tables['ai_chat_messages']['Row'];
export type AIChatInsert = Tables['ai_chat_messages']['Insert'];
