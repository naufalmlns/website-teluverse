import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const titleId = process.env.PLAYFAB_TITLE_ID;
const secretKey = process.env.PLAYFAB_SECRET_KEY;

export async function POST() {
    try {
        if (!titleId || !secretKey) {
            return NextResponse.json({ error: "PlayFab credentials missing" }, { status: 500 });
        }

        // Initialize Supabase Admin Client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // 1. Fetch all events
        const { data: dbEvents, error: eventsError } = await supabase
            .from('temporary_events')
            .select('*');

        if (eventsError) {
            console.error("Supabase Events Error:", eventsError);
            return NextResponse.json({ error: "Gagal mengambil events dari Supabase" }, { status: 500 });
        }

        // 2. Fetch all profiles to map mitra names
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name');

        if (profilesError) {
            console.error("Supabase Profiles Error:", profilesError);
        }

        // Create a lookup map for profiles
        const profileMap = new Map();
        if (profiles) {
            profiles.forEach(p => profileMap.set(p.id, p.name));
        }

        // Map events to PlayFab format (camelCase)
        const mappedEvents = dbEvents.map((evt) => {
            const mitraName = profileMap.get(evt.user_id) || 'Unknown Mitra';
            
            return {
                id: evt.id,
                mitraId: evt.user_id,
                mitraName: mitraName,
                title: evt.title,
                description: evt.description,
                location: evt.location,
                startDate: evt.start_date,
                endDate: evt.end_date,
                image: evt.image_url,
                createdAt: evt.created_at,
                quiz: evt.quiz
            };
        });

        // Push to PlayFab Events Key
        const setUrl = `https://${titleId}.playfabapi.com/Server/SetTitleData`;
        const pfResponse = await fetch(setUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-SecretKey': secretKey || ''
            },
            body: JSON.stringify({
                Key: "Events",
                Value: JSON.stringify(mappedEvents)
            })
        });

        if (!pfResponse.ok) {
            const pfError = await pfResponse.json();
            console.error("PlayFab Set Error:", pfError);
            return NextResponse.json({ error: "Gagal menyinkronkan ke PlayFab." }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            totalEvents: mappedEvents.length,
            message: `Berhasil sinkronisasi ${mappedEvents.length} event ke PlayFab.`
        });
    } catch (error) {
        console.error("Sync Events Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan internal sinkronisasi." }, { status: 500 });
    }
}
