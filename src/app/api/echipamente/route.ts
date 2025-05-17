import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Echipament } from "@/models";
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
    const denumire = searchParams.get("denumire");
    const producator = searchParams.get("producator");
    const stare = searchParams.get("stare");

    const filter: Record<string, unknown> = {};
    if (denumire) filter.denumire = { $regex: new RegExp(denumire, "i") };
    if (producator) filter.producator = { $regex: new RegExp(producator, "i") };
    if (stare && ["functional", "defect", "service"].includes(stare)) {
      filter.stare = stare;
    }

    const equipment = await Echipament.find(filter).sort({ denumire: 1 });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error("Eroare la obtinerea echipamentelor:", error);
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

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Interzis - Permisiuni insuficiente" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { denumire, producator, dataAchizitionare, stare } = await req.json();

    if (!denumire || !dataAchizitionare) {
      return NextResponse.json(
        { message: "Campuri obligatorii lipsa" },
        { status: 400 }
      );
    }

    const newEquipment = await Echipament.create({
      denumire,
      producator: producator || "",
      dataAchizitionare: new Date(dataAchizitionare),
      stare: stare || "functional"
    });

    return NextResponse.json(newEquipment, { status: 201 });
  } catch (error) {
    console.error("Eroare la crearea echipamentului:", error);
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

    if (session.user.role !== "admin") {
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

    const existingEquipment = await Echipament.findById(id);
    if (!existingEquipment) {
      return NextResponse.json(
        { message: "Echipamentul nu a fost gasit" },
        { status: 404 }
      );
    }

    const updatedEquipment = await Echipament.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedEquipment);
  } catch (error) {
    console.error("Eroare la actualizarea echipamentului:", error);
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
    
    let equipmentId = id;
    if (!equipmentId) {
      try {
        const body = await req.json();
        equipmentId = body.id;
      } catch {
      }
    }

    if (!equipmentId) {
      return NextResponse.json(
        { message: "ID-ul echipamentului este obligatoriu" },
        { status: 400 }
      );
    }

    const existingEquipment = await Echipament.findById(equipmentId);
    if (!existingEquipment) {
      return NextResponse.json(
        { message: "Echipamentul nu a fost gasit" },
        { status: 404 }
      );
    }

    await Echipament.findByIdAndDelete(equipmentId);

    return NextResponse.json(
      { message: "Echipamentul a fost sters cu succes" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Eroare la stergerea echipamentului:", error);
    return NextResponse.json(
      { message: "Eroare de server interna" },
      { status: 500 }
    );
  }
}