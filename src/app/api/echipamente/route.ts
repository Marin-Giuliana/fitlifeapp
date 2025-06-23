import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Echipament } from "@/models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
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

    // Mapează echipamentele la formatul așteptat de frontend
    const echipamenteFormatate = equipment.map(echipament => ({
      id: echipament._id,
      name: echipament.denumire,
      category: determineCategory(echipament.denumire),
      status: mapStatus(echipament.stare),
      purchaseDate: echipament.dataAchizitionare,
      notes: getStatusNotes(echipament.stare)
    }));

    return NextResponse.json({
      echipamente: echipamenteFormatate,
      statistici: {
        totalEchipamente: echipamenteFormatate.length,
        echipamenteFunctionale: echipamenteFormatate.filter(e => e.status === "functional").length,
        echipamenteDefecte: echipamenteFormatate.filter(e => e.status === "broken" || e.status === "maintenance").length,
        echipamenteInService: echipamenteFormatate.filter(e => e.status === "maintenance").length
      }
    });
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Verifică rolul utilizatorului din baza de date
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.rol !== "admin") {
      return NextResponse.json(
        { message: "Interzis - Permisiuni insuficiente" },
        { status: 403 }
      );
    }

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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Verifică rolul utilizatorului din baza de date
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.rol !== "admin") {
      return NextResponse.json(
        { message: "Interzis - Permisiuni insuficiente" },
        { status: 403 }
      );
    }

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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Verifică rolul utilizatorului din baza de date
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.rol !== "admin") {
      return NextResponse.json(
        { message: "Interzis - Permisiuni insuficiente" },
        { status: 403 }
      );
    }

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

// Funcții helper
function determineCategory(denumire: string): string {
  const nume = denumire.toLowerCase();
  
  if (nume.includes("banda") || nume.includes("bicicleta") || nume.includes("eliptica") || nume.includes("cardio")) {
    return "Cardio";
  }
  if (nume.includes("gantere") || nume.includes("haltera") || nume.includes("greutati")) {
    return "Greutăți libere";
  }
  if (nume.includes("aparat") || nume.includes("masina") || nume.includes("multifunctional")) {
    return "Aparate";
  }
  return "Accesorii";
}

function mapStatus(stare: string): string {
  switch (stare) {
    case "functional":
      return "functional";
    case "defect":
      return "broken";
    case "service":
      return "maintenance";
    default:
      return "functional";
  }
}

function getStatusNotes(stare: string): string {
  switch (stare) {
    case "functional":
      return "Echipament în stare bună de funcționare";
    case "defect":
      return "Echipament defect - necesită reparații";
    case "service":
      return "Echipament în service - mentenanță programată";
    default:
      return "Status necunoscut";
  }
}