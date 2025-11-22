import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/registrations-supabase - Get user's registrations or event registrations
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
    const userId = searchParams.get("user_id") || user.id;

    let query = supabase
      .from("registrations")
      .select(`
        *,
        event:events(
          id,
          title,
          start_date,
          end_date,
          location,
          status,
          organization:organizations(name)
        ),
        team:teams(id, name)
      `)
      .order("created_at", { ascending: false });

    if (eventId) {
      query = query.eq("event_id", eventId);
    } else {
      query = query.eq("user_id", userId);
    }

    const { data: registrations, error } = await query;

    if (error) {
      console.error("Error fetching registrations:", error);
      return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
    }

    return NextResponse.json({ registrations: registrations || [] }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/registrations-supabase - Register for an event
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { event_id, team_id, registration_data } = body;

    if (!event_id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    // Check if already registered
    const { data: existing } = await supabase
      .from("registrations")
      .select("id")
      .eq("event_id", event_id)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Already registered for this event" }, { status: 400 });
    }

    // Verify event exists and is published
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, status, max_attendees")
      .eq("id", event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "published") {
      return NextResponse.json({ error: "Event is not open for registration" }, { status: 400 });
    }

    // Check capacity if set
    if (event.max_attendees) {
      const { count } = await supabase
        .from("registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event_id)
        .eq("status", "confirmed");

      if (count && count >= event.max_attendees) {
        return NextResponse.json({ error: "Event is at full capacity" }, { status: 400 });
      }
    }

    // Create registration
    const { data: registration, error: createError } = await supabase
      .from("registrations")
      .insert({
        event_id,
        user_id: user.id,
        team_id: team_id || null,
        status: "confirmed",
        registration_data: registration_data || {},
      })
      .select(`
        *,
        event:events(id, title, start_date, location)
      `)
      .single();

    if (createError) {
      console.error("Error creating registration:", createError);
      return NextResponse.json({ error: "Failed to register" }, { status: 500 });
    }

    return NextResponse.json({ registration }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
