import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/teams-supabase - List teams for an event
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get("event_id");

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    // Get teams for the event with member count
    const { data: teams, error } = await supabase
      .from("teams")
      .select(`
        *,
        event:events(id, title),
        team_members(count)
      `)
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching teams:", error);
      return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
    }

    return NextResponse.json({ teams: teams || [] }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/teams-supabase - Create a new team
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { event_id, name, max_members } = body;

    if (!event_id || !name) {
      return NextResponse.json({ error: "Event ID and name are required" }, { status: 400 });
    }

    // Verify event exists and user has access
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("id", event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Create team
    const { data: team, error: createError } = await supabase
      .from("teams")
      .insert({
        event_id,
        name,
        max_members: max_members || 5,
        created_by: user.id,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating team:", createError);
      return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
    }

    // Add creator as team member (captain)
    await supabase
      .from("team_members")
      .insert({
        team_id: team.id,
        user_id: user.id,
        role: "captain",
      });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
