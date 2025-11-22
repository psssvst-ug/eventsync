import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/stats-supabase - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile with role
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";

    // Get statistics based on role
    let stats: any = {};

    if (isAdmin) {
      // Admin sees system-wide stats
      const [usersResult, eventsResult, orgsResult, appsResult] = await Promise.all([
        supabase.from("user_profiles").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("organizations").select("*", { count: "exact", head: true }),
        supabase.from("manager_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      // Get active events (published and not past)
      const { count: activeEvents } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("status", "published")
        .gte("end_date", new Date().toISOString());

      stats = {
        totalUsers: usersResult.count || 0,
        totalEvents: eventsResult.count || 0,
        totalOrganizations: orgsResult.count || 0,
        pendingApplications: appsResult.count || 0,
        activeEvents: activeEvents || 0,
      };
    } else {
      // Regular users/managers see their own stats
      
      // Get user's organizations
      const { data: orgMemberships } = await supabase
        .from("organization_members")
        .select("organization_id, role")
        .eq("user_id", user.id);

      const orgIds = orgMemberships?.map(m => m.organization_id) || [];
      const isManager = orgMemberships?.some(m => m.role === "admin" || m.role === "manager");

      // Get registrations count
      const { count: registrationsCount } = await supabase
        .from("registrations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get teams count
      const { count: teamsCount } = await supabase
        .from("team_members")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      stats = {
        organizationsCount: orgIds.length,
        registrationsCount: registrationsCount || 0,
        teamsCount: teamsCount || 0,
        isManager,
      };

      // If manager, add events created count
      if (isManager && orgIds.length > 0) {
        const { count: eventsCount } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .in("organization_id", orgIds);

        stats.eventsCreated = eventsCount || 0;
      }
    }

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
