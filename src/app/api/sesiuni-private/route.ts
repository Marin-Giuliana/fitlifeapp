import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { SesiunePrivata, User } from "@/models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const antrenorId = searchParams.get("antrenorId");
    const membruId = searchParams.get("membruId");
    const dataSesiune = searchParams.get("dataSesiune");
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = {};
    
    if (session.user.role === "antrenor") {
      filter["antrenor.id"] = session.user.id;
    } else if (session.user.role === "membru") {
      filter["membru.id"] = session.user.id;
    } else if (session.user.role === "admin") {
      if (antrenorId) filter["antrenor.id"] = antrenorId;
      if (membruId) filter["membru.id"] = membruId;
    }
    
    if (dataSesiune) {
      const date = new Date(dataSesiune);
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      filter.dataSesiune = { $gte: startDate, $lte: endDate };
    }
    
    if (status && ["confirmata", "anulata", "finalizata"].includes(status)) {
      filter.status = status;
    }

    const sessions = await SesiunePrivata.find(filter).sort({ dataSesiune: 1, oraSesiune: 1 });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Eroare la obtinerea sesiunilor private:", error);
    return NextResponse.json(
      { message: "Eroare de server interna" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { antrenorId, membruId, dataSesiune, oraSesiune } = await req.json();

    if (!antrenorId || !membruId || !dataSesiune || !oraSesiune) {
      return NextResponse.json(
        { message: "Campuri obligatorii lipsa" },
        { status: 400 }
      );
    }

    const trainer = await User.findOne({ 
      _id: antrenorId,
      rol: "antrenor"
    });

    if (!trainer) {
      return NextResponse.json(
        { message: "Antrenorul nu a fost gasit" },
        { status: 404 }
      );
    }

    const member = await User.findOne({ 
      _id: membruId,
      rol: "membru"
    });

    if (!member) {
      return NextResponse.json(
        { message: "Membrul nu a fost gasit" },
        { status: 404 }
      );
    }

    if (member.membru && member.membru.sedintePT <= 0) {
      return NextResponse.json(
        { message: "Membrul nu are sedinte de antrenament personal disponibile" },
        { status: 400 }
      );
    }

    const sessionDate = new Date(dataSesiune);
    sessionDate.setHours(0, 0, 0, 0);
    
    const trainerConflict = await SesiunePrivata.findOne({
      "antrenor.id": antrenorId,
      dataSesiune: sessionDate,
      oraSesiune: oraSesiune,
      status: { $ne: "anulata" }
    });

    if (trainerConflict) {
      return NextResponse.json(
        { message: "Antrenorul are deja o sesiune la aceasta ora" },
        { status: 400 }
      );
    }

    const memberConflict = await SesiunePrivata.findOne({
      "membru.id": membruId,
      dataSesiune: sessionDate,
      oraSesiune: oraSesiune,
      status: { $ne: "anulata" }
    });

    if (memberConflict) {
      return NextResponse.json(
        { message: "Membrul are deja o sesiune la aceasta ora" },
        { status: 400 }
      );
    }

    const newSession = await SesiunePrivata.create({
      antrenor: {
        id: antrenorId,
        nume: trainer.nume
      },
      membru: {
        id: membruId,
        nume: member.nume
      },
      dataSesiune: sessionDate,
      oraSesiune,
      status: "confirmata"
    });

    await User.findByIdAndUpdate(
      membruId,
      { $inc: { "membru.sedintePT": -1 } }
    );

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error("Eroare la crearea sesiunii private:", error);
    return NextResponse.json(
      { message: "Eroare de server interna" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id, updates } = await req.json();

    if (!id || !updates) {
      return NextResponse.json(
        { message: "Campuri obligatorii lipsa" },
        { status: 400 }
      );
    }

    const existingSession = await SesiunePrivata.findById(id);
    if (!existingSession) {
      return NextResponse.json(
        { message: "Sesiunea privata nu a fost gasita" },
        { status: 404 }
      );
    }

    let updatesToApply = updates;
    
    if (session.user.role === "membru") {
      if (existingSession.membru.id.toString() !== session.user.id) {
        return NextResponse.json(
          { message: "Interzis - Puteti actualiza doar propriile sesiuni" },
          { status: 403 }
        );
      }
      
      if (updates.status && updates.status !== "anulata") {
        return NextResponse.json(
          { message: "Interzis - Membrii pot doar anula sesiunile" },
          { status: 403 }
        );
      }
      
      const allowedUpdates = { status: updates.status };
      updatesToApply = allowedUpdates;
    } else if (session.user.role === "antrenor") {
      if (existingSession.antrenor.id.toString() !== session.user.id) {
        return NextResponse.json(
          { message: "Interzis - Puteti actualiza doar propriile sesiuni" },
          { status: 403 }
        );
      }
      
      if (Object.keys(updates).some(key => key !== "status")) {
        return NextResponse.json(
          { message: "Interzis - Antrenorii pot actualiza doar statusul sesiunii" },
          { status: 403 }
        );
      }
    }

    const oldStatus = existingSession.status;
    const newStatus = updatesToApply.status;
    
    if (oldStatus !== "anulata" && newStatus === "anulata") {
      await User.findByIdAndUpdate(
        existingSession.membru.id,
        { $inc: { "membru.sedintePT": 1 } }
      );
    }
    
    if (oldStatus === "anulata" && newStatus !== "anulata") {
      const member = await User.findById(existingSession.membru.id);
      
      if (member?.membru?.sedintePT <= 0) {
        return NextResponse.json(
          { message: "Nu se poate reactiva sesiunea - Membrul nu are sedinte PT disponibile" },
          { status: 400 }
        );
      }
      
      await User.findByIdAndUpdate(
        existingSession.membru.id,
        { $inc: { "membru.sedintePT": -1 } }
      );
    }

    const updatedSession = await SesiunePrivata.findByIdAndUpdate(
      id,
      { $set: updatesToApply },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Eroare la actualizarea sesiunii private:", error);
    return NextResponse.json(
      { message: "Eroare de server interna" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Interzis - Permisiuni insuficiente" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    let sessionId = id;
    if (!sessionId) {
      try {
        const body = await req.json();
        sessionId = body.id;
      } catch {
      }
    }

    if (!sessionId) {
      return NextResponse.json(
        { message: "ID-ul sesiunii este obligatoriu" },
        { status: 400 }
      );
    }

    const existingSession = await SesiunePrivata.findById(sessionId);
    if (!existingSession) {
      return NextResponse.json(
        { message: "Sesiunea privata nu a fost gasita" },
        { status: 404 }
      );
    }

    if (existingSession.status !== "anulata") {
      await User.findByIdAndUpdate(
        existingSession.membru.id,
        { $inc: { "membru.sedintePT": 1 } }
      );
    }

    await SesiunePrivata.findByIdAndDelete(sessionId);

    return NextResponse.json(
      { message: "Sesiunea privata a fost stearsa cu succes" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Eroare la stergerea sesiunii private:", error);
    return NextResponse.json(
      { message: "Eroare de server interna" },
      { status: 500 }
    );
  }
}