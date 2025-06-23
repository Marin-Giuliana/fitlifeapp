import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { SesiunePrivata } from "@/models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
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
        { message: "Interzis - Doar membrii și adminii pot accesa acest istoric" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Get all sessions for this member (or all sessions if admin for testing)
    const filter = session.user.role === "admin" 
      ? {} // Admin can see all sessions for testing
      : { "membru.id": session.user.id };
      
    const sessions = await SesiunePrivata.find(filter)
      .sort({ dataSesiune: -1, oraSesiune: -1 })
      .limit(20); // Limit to prevent too many results

    // Format sessions for frontend
    const formattedSessions = sessions.map(session => ({
      id: session._id,
      trainerId: session.antrenor.id,
      trainerName: session.antrenor.nume,
      date: session.dataSesiune,
      time: session.oraSesiune,
      status: session.status,
      duration: 60, // Default duration
      feedbackGiven: false // We'll implement this later with a separate feedback schema
    }));

    return NextResponse.json(formattedSessions);
  } catch (error) {
    console.error("Eroare la obținerea istoricului ședințelor:", error);
    return NextResponse.json(
      { message: "Eroare de server internă" },
      { status: 500 }
    );
  }
}