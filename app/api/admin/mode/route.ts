import { NextRequest, NextResponse } from 'next/server';

const titleId = process.env.PLAYFAB_TITLE_ID; 
const secretKey = process.env.PLAYFAB_SECRET_KEY;

// GET: Mengambil konfigurasi saat ini dari PlayFab
export async function GET() {
    try {
        if (!titleId || !secretKey) {
            return NextResponse.json({ error: "Kredensial PlayFab belum di-set." }, { status: 500 });
        }

        const getUrl = `https://${titleId}.playfabapi.com/Server/GetTitleData`;
        const getResponse = await fetch(getUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-SecretKey': secretKey || '' 
            },
            body: JSON.stringify({
                Keys: ["Mode", "SpecialEvent", "BuildingLocation"] 
            })
        });

        const getData = await getResponse.json();
        const titleData = getData?.data?.Data as Record<string, string>;

        let currentMode = "Normal";
        let specialEventData = { quests: [] };
        let buildingLocation = { buildings: [] };

        if (titleData) {
            if (titleData["Mode"]) {
                try {
                    const modeObj = JSON.parse(titleData["Mode"]);
                    currentMode = modeObj.Active || "Normal";
                } catch (e) { currentMode = titleData["Mode"]; }
            }
            if (titleData["SpecialEvent"]) {
                try {
                    specialEventData = JSON.parse(titleData["SpecialEvent"]);
                } catch (e) { console.error("SpecialEvent Parse Error", e); }
            }
            if (titleData["BuildingLocation"]) {
                try {
                    buildingLocation = JSON.parse(titleData["BuildingLocation"]);
                } catch (e) { console.error("BuildingLocation Parse Error", e); }
            }
        }

        return NextResponse.json({ 
            mode: currentMode, 
            specialEvent: specialEventData,
            buildingLocation: buildingLocation
        });
    } catch (error) {
        return NextResponse.json({ error: "Gagal mengambil data." }, { status: 500 });
    }
}

// POST: Menyimpan konfigurasi baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newMode = body.mode;
    const quests = body.quests; // Data quest untuk SpecialEvent

    if (!newMode) {
      return NextResponse.json({ error: "Mode tidak ditemukan." }, { status: 400 });
    }

    if (!titleId || !secretKey) {
        return NextResponse.json({ error: "Kredensial PlayFab belum di-set." }, { status: 500 });
    }

    // 1. Simpan Mode Aktif ke key "Mode"
    const modeObject = { Active: newMode };
    const setModeUrl = `https://${titleId}.playfabapi.com/Server/SetTitleData`;
    
    await fetch(setModeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-SecretKey': secretKey },
        body: JSON.stringify({
            Key: "Mode",
            Value: JSON.stringify(modeObject) 
        })
    });

    // 2. Jika SpecialEvent, simpan data quest ke key "SpecialEvent"
    if (newMode === 'SpecialEvent' && quests) {
        await fetch(setModeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-SecretKey': secretKey },
            body: JSON.stringify({
                Key: "SpecialEvent",
                Value: JSON.stringify({ quests }) 
            })
        });
    }

    return NextResponse.json({ success: true, mode: newMode });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal." }, { status: 500 });
  }
}