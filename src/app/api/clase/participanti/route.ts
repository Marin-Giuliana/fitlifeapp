import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Clasa, User } from "@/models";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { classId, userId } = await req.json();

    if (!classId || !userId) {
      return NextResponse.json(
        { message: "ID-ul clasei si ID-ul utilizatorului sunt obligatorii" },
        { status: 400 }
      );
    }

    const classData = await Clasa.findById(classId);
    if (!classData) {
      return NextResponse.json(
        { message: "Clasa nu a fost gasita" },
        { status: 404 }
      );
    }

    if (classData.participanti.length >= classData.nrLocuri) {
      return NextResponse.json(
        { message: "Clasa este completa" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ _id: userId, rol: "membru" });
    if (!user) {
      return NextResponse.json(
        { message: "Utilizatorul nu a fost gasit sau nu este membru" },
        { status: 404 }
      );
    }

    type Participant = { id: string; nume: string; status: string };
    const isEnrolled = classData.participanti.some(
      (p: Participant) => p.id.toString() === userId
    );
    
    if (isEnrolled) {
      return NextResponse.json(
        { message: "Utilizatorul este deja inscris la aceasta clasa" },
        { status: 400 }
      );
    }

    const updatedClass = await Clasa.findByIdAndUpdate(
      classId,
      {
        $push: {
          participanti: {
            id: userId,
            nume: user.nume,
            status: "inscris"
          }
        }
      },
      { new: true }
    );

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error("Eroare la adaugarea participantului la clasa:", error);
    return NextResponse.json(
      { message: "Eroare de server interna" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin" && session.user.role !== "antrenor") {
      return NextResponse.json(
        { message: "Interzis - Permisiuni insuficiente" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { classId, userId, status } = await req.json();

    if (!classId || !userId || !status) {
      return NextResponse.json(
        { message: "ID-ul clasei, ID-ul utilizatorului si statusul sunt obligatorii" },
        { status: 400 }
      );
    }

    if (!["inscris", "anulat", "prezent"].includes(status)) {
      return NextResponse.json(
        { message: "Status invalid. Trebuie sa fie 'inscris', 'anulat' sau 'prezent'" },
        { status: 400 }
      );
    }

    const classData = await Clasa.findById(classId);
    if (!classData) {
      return NextResponse.json(
        { message: "Clasa nu a fost gasita" },
        { status: 404 }
      );
    }

    type Participant = { id: string; nume: string; status: string };
    const participantIndex = classData.participanti.findIndex(
      (p: Participant) => p.id.toString() === userId
    );
    
    if (participantIndex === -1) {
      return NextResponse.json(
        { message: "Utilizatorul nu este inscris la aceasta clasa" },
        { status: 404 }
      );
    }

    const updatedClass = await Clasa.findOneAndUpdate(
      { _id: classId, "participanti.id": userId },
      {
        $set: {
          "participanti.$.status": status
        }
      },
      { new: true }
    );

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error("Eroare la actualizarea statusului participantului:", error);
    return NextResponse.json(
      { message: "Eroare de server interna" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const url = new URL(req.url);
    const classId = url.searchParams.get("classId");
    const userId = url.searchParams.get("userId");
    
    let finalClassId = classId;
    let finalUserId = userId;
    
    if (!finalClassId || !finalUserId) {
      try {
        const body = await req.json();
        finalClassId = finalClassId || body.classId;
        finalUserId = finalUserId || body.userId;
      } catch {
      }
    }

    if (!finalClassId || !finalUserId) {
      return NextResponse.json(
        { message: "ID-ul clasei si ID-ul utilizatorului sunt obligatorii" },
        { status: 400 }
      );
    }

    const isSelfRemoval = finalUserId === session.user.id;
    const isAdminOrTrainer = ["admin", "antrenor"].includes(session.user.role as string);
    
    if (!isSelfRemoval && !isAdminOrTrainer) {
      return NextResponse.json(
        { message: "Interzis - Puteti sterge doar propria inscriere" },
        { status: 403 }
      );
    }

    const classData = await Clasa.findById(finalClassId);
    if (!classData) {
      return NextResponse.json(
        { message: "Clasa nu a fost gasita" },
        { status: 404 }
      );
    }

    type Participant = { id: string; nume: string; status: string };
    const isEnrolled = classData.participanti.some(
      (p: Participant) => p.id.toString() === finalUserId
    );
    
    if (!isEnrolled) {
      return NextResponse.json(
        { message: "Utilizatorul nu este inscris la aceasta clasa" },
        { status: 404 }
      );
    }

    const updatedClass = await Clasa.findByIdAndUpdate(
      finalClassId,
      {
        $pull: {
          participanti: {
            id: finalUserId
          }
        }
      },
      { new: true }
    );

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error("Eroare la stergerea participantului din clasa:", error);
    return NextResponse.json(
      { message: "Eroare de server interna" },
      { status: 500 }
    );
  }
}