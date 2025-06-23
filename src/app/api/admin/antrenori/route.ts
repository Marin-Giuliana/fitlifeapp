import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Nu ești autentificat" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });
    
    if (!user || user.rol !== "admin") {
      return NextResponse.json(
        { error: "Nu ai permisiuni de administrator" },
        { status: 403 }
      );
    }

    // Găsește toți antrenorii
    const antrenori = await User.find({ 
      rol: "antrenor" 
    }).select('nume email dataNasterii sex antrenor');

    // Găsește toți membrii care pot fi promovați la antrenor
    const membri = await User.find({ 
      rol: "membru" 
    }).select('nume email');

    // Formatează datele antrenorilor
    const antrenoriFormatati = antrenori.map(antrenor => ({
      id: antrenor._id,
      nume: antrenor.nume,
      email: antrenor.email,
      telefon: "Nu este specificat",
      dataNasterii: antrenor.dataNasterii,
      sex: antrenor.sex,
      dataInregistrare: new Date(),
      specializari: antrenor.antrenor?.specializari || [],
      experienta: "Nu este specificat",
      certificari: [],
      status: "activ",
      rating: 0,
      numarClienti: 0
    }));

    // Calculează statistici
    const statistici = {
      totalAntrenori: antrenoriFormatati.length,
      antrenoriActivi: antrenoriFormatati.length,
      antrenoriInactivi: 0,
      ratingMediu: 0
    };

    // Formatează datele membrilor
    const membriFormatati = membri.map(membru => ({
      id: membru._id,
      nume: membru.nume,
      email: membru.email
    }));

    return NextResponse.json({
      antrenori: antrenoriFormatati,
      membri: membriFormatati,
      statistici
    });

  } catch (error) {
    console.error("Eroare la obținerea antrenorilor:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Nu ești autentificat" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });
    
    if (!user || user.rol !== "admin") {
      return NextResponse.json(
        { error: "Nu ai permisiuni de administrator" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, antrenorId, updateData, membruId } = body;

    if (action === "update") {
      const antrenor = await User.findById(antrenorId);
      
      if (!antrenor || antrenor.rol !== "antrenor") {
        return NextResponse.json(
          { error: "Antrenorul nu a fost găsit" },
          { status: 404 }
        );
      }

      // Actualizează datele antrenorului
      if (updateData.nume) antrenor.nume = updateData.nume;
      if (updateData.email) antrenor.email = updateData.email;
      if (updateData.telefon) antrenor.telefon = updateData.telefon;
      
      if (updateData.antrenor) {
        if (!antrenor.antrenor) antrenor.antrenor = {};
        if (updateData.antrenor.specializari) antrenor.antrenor.specializari = updateData.antrenor.specializari;
        if (updateData.antrenor.experienta) antrenor.antrenor.experienta = updateData.antrenor.experienta;
        if (updateData.antrenor.certificari) antrenor.antrenor.certificari = updateData.antrenor.certificari;
        if (updateData.antrenor.status) antrenor.antrenor.status = updateData.antrenor.status;
      }

      await antrenor.save();

      return NextResponse.json({
        message: "Antrenorul a fost actualizat cu succes!",
        antrenor: {
          id: antrenor._id,
          nume: antrenor.nume,
          email: antrenor.email,
          telefon: antrenor.telefon,
          specializari: antrenor.antrenor?.specializari || [],
          experienta: antrenor.antrenor?.experienta || "",
          certificari: antrenor.antrenor?.certificari || [],
          status: antrenor.antrenor?.status || "activ"
        }
      });
    }

    if (action === "demote") {
      const antrenor = await User.findById(antrenorId);
      
      if (!antrenor || antrenor.rol !== "antrenor") {
        return NextResponse.json(
          { error: "Antrenorul nu a fost găsit" },
          { status: 404 }
        );
      }

      // Schimbă rolul în membru
      antrenor.rol = "membru";
      await antrenor.save();

      return NextResponse.json({
        message: "Antrenorul a fost retrogradat la membru cu succes!"
      });
    }

    if (action === "promote") {
      const membru = await User.findById(membruId);
      
      if (!membru || membru.rol !== "membru") {
        return NextResponse.json(
          { error: "Membrul nu a fost găsit" },
          { status: 404 }
        );
      }

      // Schimbă rolul în antrenor și inițializează obiectul antrenor
      membru.rol = "antrenor";
      if (!membru.antrenor) {
        membru.antrenor = {
          dataAngajarii: new Date(),
          specializari: []
        };
      }
      await membru.save();

      return NextResponse.json({
        message: "Membrul a fost promovat la antrenor cu succes!"
      });
    }

    return NextResponse.json(
      { error: "Acțiune nevalidă" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Eroare la actualizarea antrenorului:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}