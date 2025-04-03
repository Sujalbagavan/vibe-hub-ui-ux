
import { EventRow, CommentRow, VolunteerRoleRow, ProfileRow } from "@/types/supabase";
import { Event, EventLocation, Comment, VolunteerRole, User } from "@/types";

export const mapEventFromSupabase = (eventRow: EventRow & {
  event_attendees?: any[];
  volunteer_roles?: VolunteerRoleRow[];
  event_volunteers?: any[];
  event_comments?: (CommentRow & { profiles?: ProfileRow })[];
}): Event => {
  const location: EventLocation = eventRow.location as unknown as EventLocation;
  
  // Map volunteer roles
  const volunteerRoles: VolunteerRole[] = eventRow.volunteer_roles?.map(role => ({
    id: role.id,
    title: role.title,
    description: role.description,
    spotsTotal: role.spots_total,
    spotsFilled: role.spots_filled
  })) || [];
  
  // Map volunteers
  const volunteers: Record<string, string[]> = {};
  if (eventRow.event_volunteers?.length) {
    eventRow.event_volunteers.forEach(v => {
      if (!volunteers[v.role_id]) {
        volunteers[v.role_id] = [];
      }
      volunteers[v.role_id].push(v.user_id);
    });
  }
  
  // Map attendees
  const attendees = eventRow.event_attendees?.map(a => a.user_id) || [];
  
  // Map comments
  const comments: Comment[] = eventRow.event_comments?.map(comment => {
    const profile = comment.profiles;
    return {
      id: comment.id,
      userId: comment.user_id,
      userName: profile?.full_name || 'Anonymous',
      userAvatar: profile?.avatar_url,
      content: comment.content,
      createdAt: comment.created_at
    };
  }) || [];
  
  return {
    id: eventRow.id,
    title: eventRow.title,
    description: eventRow.description,
    image: eventRow.image || undefined,
    date: eventRow.date,
    startTime: eventRow.start_time.toString(),
    endTime: eventRow.end_time.toString(),
    location,
    organizerId: eventRow.organizer_id,
    organizerName: eventRow.organizer_name,
    category: eventRow.category,
    volunteerRoles,
    attendees,
    volunteers,
    comments,
    isFree: eventRow.is_free,
    ticketPrice: eventRow.ticket_price || undefined,
    totalSpots: eventRow.total_spots || undefined,
    spotsRemaining: eventRow.spots_remaining || undefined
  };
};

export const mapUserFromSupabase = (userId: string, profile?: ProfileRow): User => {
  return {
    id: userId,
    name: profile?.full_name || 'User',
    email: '',  // Email comes from auth.user which we can't directly access in RLS
    role: (profile?.user_role as 'organizer' | 'attendee') || 'attendee',
    avatar: profile?.avatar_url
  };
};
