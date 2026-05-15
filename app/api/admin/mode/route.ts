import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newMode = body.mode;

    if (!newMode) {
      return NextResponse.json({ error: "Mode tidak ditemukan dalam request dari web." }, { status: 400 });
    }

    // ⚠️ PASTIKAN ANDA MENGGANTI DUA BARIS INI DENGAN DATA ASLI DARI PLAYFAB ANDA
    const titleId = "152E0"; 
    const secretKey = "MUSYYTXPRQRCMTYQF969WT5B8GSBXYTSSEFU741S4R6IJRQHGS";

    // --- LANGKAH 1: Ambil data lama dari PlayFab ---
    const getUrl = `https://${titleId}.playfabapi.com/Server/GetTitleData`;
    const getResponse = await fetch(getUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-SecretKey': secretKey 
        },
        body: JSON.stringify({
            Keys: ["Mode"] 
        })
    });

    const getData = await getResponse.json();

    // PENGECEKAN 1: Apakah PlayFab menolak koneksi kita? (Misal kunci rahasia salah)
    if (!getResponse.ok || getData.code !== 200) {
        console.error("PlayFab Get Error:", getData);
        return NextResponse.json(
            { error: "Koneksi ke PlayFab ditolak. Pastikan Title ID dan Secret Key sudah benar." }, 
            { status: 400 }
        );
    }

    // PENGECEKAN 2: Apakah variabel "Mode" benar-benar ada di database PlayFab?
   // PENGECEKAN 2: Apakah variabel "Mode" benar-benar ada di database PlayFab?
    // Tambahkan 'as Record<string, string>' agar TypeScript paham bentuk datanya
    const titleData = getData?.data?.Data as Record<string, string>;
    
    if (!titleData || !titleData["Mode"]) {
         return NextResponse.json(
            { error: "Data 'Mode' belum ada di PlayFab Anda. Buat dulu Key 'Mode' di Title Data." }, 
            { status: 404 }
        );
    }
    
    // Sekarang TypeScript tidak akan protes lagi
   // Gunakan 'const' karena nilai mentahnya tidak kita ubah-ubah lagi
    const currentModeDataRaw = titleData["Mode"];
    
    // Kita beritahu ESLint bentuk pasti dari JSON-nya (menggantikan 'any')
    let modeObject: { Active: string; [key: string]: unknown };

    // PENGECEKAN 3: Mengamankan JSON.parse agar web tidak crash kalau format di PlayFab berantakan
    try {
        modeObject = JSON.parse(currentModeDataRaw);
    } catch (parseError) {
        console.error("Isi raw PlayFab yang menyebabkan error:", currentModeDataRaw);
        return NextResponse.json(
            { error: "Isi data 'Mode' di PlayFab bukan format JSON yang benar. Coba perbaiki strukturnya di PlayFab." }, 
            { status: 400 }
        );
    }

    // --- LANGKAH 2: Ubah hanya bagian "Active" ---
    // Pastikan kita benar-benar mengubah struktur yang tepat
    modeObject.Active = newMode; 

    // --- LANGKAH 3: Simpan kembali ke PlayFab ---
    const setUrl = `https://${titleId}.playfabapi.com/Server/SetTitleData`;
    const setResponse = await fetch(setUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-SecretKey': secretKey 
        },
        body: JSON.stringify({
            Key: "Mode",
            Value: JSON.stringify(modeObject) 
        })
    });

    if (setResponse.ok) {
        return NextResponse.json({ success: true, newActive: modeObject.Active });
    } else {
        const setError = await setResponse.json();
        console.error("PlayFab Set Error:", setError);
        return NextResponse.json({ error: "Gagal menyimpan perubahan ke database PlayFab." }, { status: 500 });
    }

  } catch (error) {
    console.error("Critical Server Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server web." }, { status: 500 });
  }
}