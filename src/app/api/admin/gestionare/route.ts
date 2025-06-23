import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Clasa from "@/models/Clasa";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get('weekStart');
    
    let startDate: Date;
    let endDate: Date;

    if (weekStart) {
      startDate = new Date(weekStart);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);
      
      startDate = monday;
      endDate = new Date(monday);
      endDate.setDate(monday.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    }

    // Obține clasele pentru săptămâna selectată
    const clase = await Clasa.find({
      dataClasa: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .populate('antrenor.id', 'nume')
    .sort({ dataClasa: 1, oraClasa: 1 });

    // Obține toți antrenorii
    const antrenori = await User.find({ rol: "antrenor" }).select('nume email antrenor');

    // Mapează tipurile de clase
    const tipuriClase = [
      { id: 1, name: "Pilates", color: "bg-pink-500" },
      { id: 2, name: "Yoga", color: "bg-purple-500" },
      { id: 3, name: "Spinning", color: "bg-blue-500" },
      { id: 4, name: "Zumba", color: "bg-yellow-500" },
      { id: 5, name: "Crossfit", color: "bg-red-500" },
      { id: 6, name: "Body Pump", color: "bg-green-500" },
    ];

    // Echipamentele se încarcă separat prin API-ul /api/echipamente
    interface Echipament {
      _id?: string;
      nume?: string;
      status: "functional" | "broken" | "maintenance" | string;
      [key: string]: unknown;
    }
    const echipamente: Echipament[] = [];

    // Formatează datele pentru frontend
    const claseFormatate = clase.map(clasa => {
      const tipClasa = tipuriClase.find(tip => tip.name === clasa.tipClasa) || tipuriClase[0];
      
      return {
        id: clasa._id,
        classTypeId: tipClasa.id,
        trainerId: clasa.antrenor.id._id,
        trainerName: clasa.antrenor.nume,
        date: clasa.dataClasa,
        time: clasa.oraClasa,
        duration: 60, // Default 60 minute
        maxParticipants: clasa.nrLocuri,
        currentParticipants: clasa.participanti.length,
        location: "Sala 1", // Default location
        status: "scheduled",
        classType: {
          id: tipClasa.id,
          name: tipClasa.name,
          color: tipClasa.color
        }
      };
    });

    // Formatează antrenorii
    const antrenoriFormatati = antrenori.map(antrenor => ({
      id: antrenor._id,
      name: antrenor.nume,
      email: antrenor.email,
      avatar: "/avatar-placeholder.png",
      specialization: antrenor.antrenor?.specializari?.join(", ") || "Fitness General",
      status: "active"
    }));

    // Calculează statistici
    const totalClase = claseFormatate.length;
    const totalParticipanti = claseFormatate.reduce((sum, clasa) => sum + clasa.currentParticipants, 0);
    const echipamenteFunctionale = echipamente.filter(e => e.status === "functional").length;
    const echipamenteDefecte = echipamente.filter(e => e.status === "broken" || e.status === "maintenance").length;

    const responseData = {
      clase: claseFormatate,
      antrenori: antrenoriFormatati,
      tipuriClase,
      echipamente,
      perioada: {
        startDate,
        endDate
      },
      statistici: {
        totalClase,
        totalParticipanti,
        echipamenteFunctionale,
        echipamenteDefecte
      }
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Eroare la obținerea datelor de gestionare:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}

// POST pentru crearea unei clase noi
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Nu ești autentificat" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      classTypeId, 
      trainerId, 
      date, 
      time, 
      duration, 
      maxParticipants, 
      location 
    } = body;

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });

    if (!user || user.rol !== "admin") {
      return NextResponse.json(
        { error: "Nu ai permisiuni de administrator" },
        { status: 403 }
      );
    }

    // Găsește antrenorul
    const antrenor = await User.findById(trainerId);
    if (!antrenor || antrenor.rol !== "antrenor") {
      return NextResponse.json(
        { error: "Antrenorul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Mapează tipul clasei
    const tipuriClase = ["Pilates", "Yoga", "Spinning", "Zumba", "Crossfit", "Body Pump"];
    const tipClasa = tipuriClase[parseInt(classTypeId) - 1];

    if (!tipClasa) {
      return NextResponse.json(
        { error: "Tipul clasei nu este valid" },
        { status: 400 }
      );
    }

    // Creează data și ora clasei
    const dataClasa = new Date(`${date}T00:00:00.000Z`);

    // Verifică dacă nu există deja o clasă la aceeași oră
    const clasaExistenta = await Clasa.findOne({
      dataClasa: dataClasa,
      oraClasa: time,
      'antrenor.id': trainerId
    });

    if (clasaExistenta) {
      return NextResponse.json(
        { error: "Antrenorul are deja o clasă programată la această oră" },
        { status: 400 }
      );
    }

    // Creează clasa nouă
    const clasaNoua = new Clasa({
      tipClasa: tipClasa,
      nrLocuri: maxParticipants,
      antrenor: {
        id: antrenor._id,
        nume: antrenor.nume
      },
      dataClasa: dataClasa,
      oraClasa: time,
      participanti: []
    });

    await clasaNoua.save();

    return NextResponse.json({
      message: "Clasa a fost creată cu succes!",
      clasa: {
        id: clasaNoua._id,
        classTypeId: parseInt(classTypeId),
        trainerId: antrenor._id,
        trainerName: antrenor.nume,
        date: dataClasa,
        time: time,
        duration: duration,
        maxParticipants: maxParticipants,
        currentParticipants: 0,
        location: location,
        status: "scheduled"
      }
    });

  } catch (error) {
    console.error("Eroare la crearea clasei:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}

// PUT pentru editarea unei clase existente
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Nu ești autentificat" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      clasaId,
      classTypeId, 
      trainerId, 
      date, 
      time, 
      maxParticipants
    } = body;

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });

    if (!user || user.rol !== "admin") {
      return NextResponse.json(
        { error: "Nu ai permisiuni de administrator" },
        { status: 403 }
      );
    }

    const clasa = await Clasa.findById(clasaId);
    if (!clasa) {
      return NextResponse.json(
        { error: "Clasa nu a fost găsită" },
        { status: 404 }
      );
    }

    // Actualizează clasa
    if (trainerId) {
      const antrenor = await User.findById(trainerId);
      if (antrenor && antrenor.rol === "antrenor") {
        clasa.antrenor.id = antrenor._id;
        clasa.antrenor.nume = antrenor.nume;
      }
    }

    if (classTypeId) {
      const tipuriClase = ["Pilates", "Yoga", "Spinning", "Zumba", "Crossfit", "Body Pump"];
      const tipClasa = tipuriClase[parseInt(classTypeId) - 1];
      if (tipClasa) {
        clasa.tipClasa = tipClasa;
      }
    }

    if (date) clasa.dataClasa = new Date(`${date}T00:00:00.000Z`);
    if (time) clasa.oraClasa = time;
    if (maxParticipants) clasa.nrLocuri = maxParticipants;

    await clasa.save();

    return NextResponse.json({
      message: "Clasa a fost actualizată cu succes!"
    });

  } catch (error) {
    console.error("Eroare la actualizarea clasei:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}

// DELETE pentru ștergerea unei clase
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Nu ești autentificat" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const clasaId = searchParams.get('clasaId');

    if (!clasaId) {
      return NextResponse.json(
        { error: "ID-ul clasei este necesar" },
        { status: 400 }
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

    const clasa = await Clasa.findById(clasaId);
    if (!clasa) {
      return NextResponse.json(
        { error: "Clasa nu a fost găsită" },
        { status: 404 }
      );
    }

    // Verifică dacă sunt participanți înscriși
    if (clasa.participanti.length > 0) {
      return NextResponse.json(
        { error: "Nu poți șterge o clasă care are participanți înscriși" },
        { status: 400 }
      );
    }

    await Clasa.findByIdAndDelete(clasaId);

    return NextResponse.json({
      message: "Clasa a fost ștearsă cu succes!"
    });

  } catch (error) {
    console.error("Eroare la ștergerea clasei:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}