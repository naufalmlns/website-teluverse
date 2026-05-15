import { NextRequest, NextResponse } from 'next/server';

const titleId = "152E0"; 
const secretKey = "MUSYYTXPRQRCMTYQF969WT5B8GSBXYTSSEFU741S4R6IJRQHGS";

export async function GET() {
    try {
        const response = await fetch(`https://${titleId}.playfabapi.com/Server/GetTitleData`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-SecretKey': secretKey },
            // KITA MENGAMBIL 2 DATA SEKALIGUS DARI PLAYFAB
            body: JSON.stringify({ Keys: ["SpecialEvent", "BuildingLocation"] }) 
        });
        
        const getData = await response.json();
        const titleData = getData?.data?.Data as Record<string, string>;
        
        let quests = [];
        let buildings = [];

        // Parse data event saat ini
        if (titleData && titleData["SpecialEvent"]) {
            quests = JSON.parse(titleData["SpecialEvent"]).quests || [];
        }
        
        // Parse data master gedung
        if (titleData && titleData["BuildingLocation"]) {
            buildings = JSON.parse(titleData["BuildingLocation"]).buildings || [];
        }

        return NextResponse.json({ quests, buildings });
    } catch (error) {
        return NextResponse.json({ error: "Gagal memuat data dari server" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const quests = body.quests;

        if (!quests || !Array.isArray(quests)) {
            return NextResponse.json({ error: "Format data salah." }, { status: 400 });
        }

        const payload = { quests: quests };

        const response = await fetch(`https://${titleId}.playfabapi.com/Server/SetTitleData`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-SecretKey': secretKey },
            body: JSON.stringify({ 
                Key: "SpecialEvent", 
                Value: JSON.stringify(payload) 
            })
        });

        if (response.ok) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: "Gagal menyimpan ke PlayFab" }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
    }
}