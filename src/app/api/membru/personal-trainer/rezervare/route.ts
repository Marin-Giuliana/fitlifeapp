import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { SesiunePrivata, User } from "@/models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    if (session.user.role !== "membru" && session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Interzis - Doar membrii și adminii pot rezerva ședințe" },
        { status: 403 }
      );
    }

    // Define Abonament type at top-level so it's available everywhere
    type Abonament = {
      status: string;
      dataSfarsit: string | Date;
      tipAbonament: string;
    };

    await connectToDatabase();

    const { antrenorId, dataSesiune, oraSesiune } = await req.json();

    if (!antrenorId || !dataSesiune || !oraSesiune) {
      return NextResponse.json(
        { message: "Toate câmpurile sunt obligatorii" },
        { status: 400 }
      );
    }

    // Check if member exists and has available PT sessions (skip for admin testing)
    const member = await User.findById(session.user.id);
    if (!member) {
      return NextResponse.json(
        { message: "Utilizatorul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Skip subscription checks for admin users (for testing purposes)
    if (session.user.role !== "admin") {
      // Check subscription and available sessions

      const hasValidSubscription = member.membru?.abonamente?.some((ab: Abonament) => 
        ab.status === "valabil" && 
        new Date(ab.dataSfarsit) > new Date() &&
        (ab.tipAbonament === "Premium")
      );

      const hasAvailableSessions = member.membru?.sedintePT > 0;

      if (!hasValidSubscription && !hasAvailableSessions) {
        return NextResponse.json(
          { message: "Nu aveți acces la ședințe de antrenament personal. Aveți nevoie de un abonament Premium sau ședințe extra." },
          { status: 403 }
        );
      }
    }

    // Get trainer info
    const trainer = await User.findOne({ 
      _id: antrenorId,
      rol: "antrenor"
    });

    if (!trainer) {
      return NextResponse.json(
        { message: "Antrenorul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Validate that the session is not in the past
    const sessionDate = new Date(dataSesiune);
    const [hours, minutes] = oraSesiune.split(':').map(Number);
    const sessionDateTime = new Date(sessionDate);
    sessionDateTime.setHours(hours, minutes, 0, 0);
    
    if (sessionDateTime <= new Date()) {
      return NextResponse.json(
        { message: "Nu poți rezerva o ședință în trecut" },
        { status: 400 }
      );
    }
    
    // Check for conflicts
    sessionDate.setHours(0, 0, 0, 0);
    
    const trainerConflict = await SesiunePrivata.findOne({
      "antrenor.id": antrenorId,
      dataSesiune: sessionDate,
      oraSesiune: oraSesiune,
      status: { $ne: "anulata" }
    });

    if (trainerConflict) {
      return NextResponse.json(
        { message: "Antrenorul are deja o ședință rezervată la această oră" },
        { status: 400 }
      );
    }

    const memberConflict = await SesiunePrivata.findOne({
      "membru.id": session.user.id,
      dataSesiune: sessionDate,
      oraSesiune: oraSesiune,
      status: { $ne: "anulata" }
    });

    if (memberConflict) {
      return NextResponse.json(
        { message: "Aveți deja o ședință rezervată la această oră" },
        { status: 400 }
      );
    }

    // Create the session
    const newSession = await SesiunePrivata.create({
      antrenor: {
        id: antrenorId,
        nume: trainer.nume
      },
      membru: {
        id: session.user.id,
        nume: member.nume
      },
      dataSesiune: sessionDate,
      oraSesiune,
      status: "confirmata"
    });

    // Decrease available PT sessions if not Premium subscription (skip for admin)
    if (session.user.role !== "admin") {
      const hasValidSubscription = member.membru?.abonamente?.some((ab: Abonament) => 
        ab.status === "valabil" && 
        new Date(ab.dataSfarsit) > new Date() &&
        (ab.tipAbonament === "Premium")
      );
      const hasAvailableSessions = member.membru?.sedintePT > 0;
      
      if (!hasValidSubscription && hasAvailableSessions) {
        await User.findByIdAndUpdate(
          session.user.id,
          { $inc: { "membru.sedintePT": -1 } }
        );
      }
    }

    return NextResponse.json({
      message: "Ședința a fost rezervată cu succes",
      session: newSession
    }, { status: 201 });

  } catch (error) {
    console.error("Eroare la rezervarea ședinței:", error);
    return NextResponse.json(
      { message: "Eroare de server internă" },
      { status: 500 }
    );
  }
}