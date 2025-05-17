import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Clasa, User } from "@/models";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const tipClasa = searchParams.get("tipClasa");
    const antrenorId = searchParams.get("antrenorId");
    const dataClasa = searchParams.get("dataClasa");

    const filter: Record<string, unknown> = {};
    if (tipClasa) filter.tipClasa = tipClasa;
    if (antrenorId) filter["antrenor.id"] = antrenorId;
    if (dataClasa) {
      const date = new Date(dataClasa);
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      filter.dataClasa = { $gte: startDate, $lte: endDate };
    }

    const classes = await Clasa.find(filter).sort({ dataClasa: 1, oraClasa: 1 });

    return NextResponse.json(classes);
  } catch (error) {
    console.error("Eroare la obtinerea claselor:", error);
    return NextResponse.json(
      { message: "Eroare de server interna" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const { tipClasa, nrLocuri, antrenor, dataClasa, oraClasa } = await req.json();

    if (!tipClasa || !nrLocuri || !antrenor || !dataClasa || !oraClasa) {
      return NextResponse.json(
        { message: "Campuri obligatorii lipsa" },
        { status: 400 }
      );
    }

    const trainerExists = await User.findOne({ 
      _id: antrenor.id,
      rol: "antrenor"
    });

    if (!trainerExists) {
      return NextResponse.json(
        { message: "Antrenorul nu a fost gasit" },
        { status: 404 }
      );
    }

    const newClass = await Clasa.create({
      tipClasa,
      nrLocuri,
      antrenor: {
        id: antrenor.id,
        nume: antrenor.nume
      },
      dataClasa: new Date(dataClasa),
      oraClasa,
      participanti: []
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("Eroare la crearea clasei:", error);
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

    const { id, updates } = await req.json();

    if (!id || !updates) {
      return NextResponse.json(
        { message: "Campuri obligatorii lipsa" },
        { status: 400 }
      );
    }

    const existingClass = await Clasa.findById(id);
    if (!existingClass) {
      return NextResponse.json(
        { message: "Clasa nu a fost gasita" },
        { status: 404 }
      );
    }

    if (updates.antrenor && updates.antrenor.id) {
      const trainerExists = await User.findOne({ 
        _id: updates.antrenor.id,
        rol: "antrenor"
      });

      if (!trainerExists) {
        return NextResponse.json(
          { message: "Antrenorul nu a fost gasit" },
          { status: 404 }
        );
      }
    }

    const updatedClass = await Clasa.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error("Eroare la actualizarea clasei:", error);
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

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Interzis - Permisiuni insuficiente" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    let classId = id;
    if (!classId) {
      try {
        const body = await req.json();
        classId = body.id;
      } catch {
      }
    }

    if (!classId) {
      return NextResponse.json(
        { message: "ID-ul clasei este obligatoriu" },
        { status: 400 }
      );
    }

    const existingClass = await Clasa.findById(classId);
    if (!existingClass) {
      return NextResponse.json(
        { message: "Clasa nu a fost gasita" },
        { status: 404 }
      );
    }

    await Clasa.findByIdAndDelete(classId);

    return NextResponse.json(
      { message: "Clasa a fost stearsa cu succes" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Eroare la stergerea clasei:", error);
    return NextResponse.json(
      { message: "Eroare de server interna" },
      { status: 500 }
    );
  }
}