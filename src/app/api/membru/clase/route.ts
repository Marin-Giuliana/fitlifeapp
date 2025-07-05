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

    const user = await User.findOne({ email: session.user.email }).select(
      "nume email rol membru.abonamente"
    );

    if (!user) {
      return NextResponse.json(
        { error: "Utilizatorul nu a fost găsit" },
        { status: 404 }
      );
    }

    const isAuthorized = ["membru", "antrenor", "admin"].includes(user.rol);
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Nu ai permisiuni să accesezi clasele" },
        { status: 403 }
      );
    }

    let areAbonamentValabil = true;
    let tipAbonament = null;
    if (user.rol === "membru") {
      interface Abonament {
        status: string;
        dataSfarsit: string | Date;
        tipAbonament: string;
      }
      const abonamentActiv = user.membru?.abonamente?.find(
        (abonament: Abonament) => 
          abonament.status === "valabil" && 
          new Date(abonament.dataSfarsit) > new Date()
      );
      areAbonamentValabil = !!abonamentActiv;
      tipAbonament = abonamentActiv?.tipAbonament || null;
      
      // Check if user has access to group classes (Standard+ or Premium)
      const areAccesClase = tipAbonament === "Standard+" || tipAbonament === "Premium";
      areAbonamentValabil = areAbonamentValabil && areAccesClase;
    }

    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get('weekStart');
    
    let startDate: Date;
    let endDate: Date;

    if (weekStart) {
      startDate = new Date(weekStart);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // 7 zile
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

    const clase = await Clasa.find({
      dataClasa: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .populate('antrenor.id', 'nume')
    .sort({ dataClasa: 1, oraClasa: 1 });

    const claseUtilizator = await Clasa.find({
      'participanti.id': user._id
    })
    .populate('antrenor.id', 'nume')
    .sort({ dataClasa: -1 });

    const tipuriClase = [
      { id: 1, name: "Pilates", color: "bg-pink-500" },
      { id: 2, name: "Yoga", color: "bg-purple-500" },
      { id: 3, name: "Spinning", color: "bg-blue-500" },
      { id: 4, name: "Zumba", color: "bg-yellow-500" },
      { id: 5, name: "Crossfit", color: "bg-red-500" },
      { id: 6, name: "Body Pump", color: "bg-green-500" },
    ];

    interface Participant {
      id: string | { toString(): string };
      nume: string;
      status: string;
    }

    const claseFormatate = clase.map(clasa => {
      const tipClasa = tipuriClase.find(tip => tip.name === clasa.tipClasa) || tipuriClase[0];
      const participantCurent = clasa.participanti.find((p: Participant) => p.id.toString() === user._id.toString());
      
      return {
        id: clasa._id,
        typeId: tipClasa.id,
        date: clasa.dataClasa,
        time: clasa.oraClasa,
        instructor: {
          id: clasa.antrenor.id._id,
          name: clasa.antrenor.nume,
          avatar: "/avatar-placeholder.png"
        },
        participants: clasa.participanti.length,
        maxParticipants: clasa.nrLocuri,
        enrolled: !!participantCurent,
        status: participantCurent?.status || null
      };
    });

    const claseUtilizatorFormatate = claseUtilizator.map(clasa => {
      const tipClasa = tipuriClase.find(tip => tip.name === clasa.tipClasa) || tipuriClase[0];
      const participantCurent = clasa.participanti.find((p: Participant) => p.id.toString() === user._id.toString());
      
      return {
        id: clasa._id,
        typeId: tipClasa.id,
        date: clasa.dataClasa,
        time: clasa.oraClasa,
        instructor: {
          id: clasa.antrenor.id._id,
          name: clasa.antrenor.nume,
          avatar: "/avatar-placeholder.png"
        },
        status: participantCurent?.status || 'inscris'
      };
    });

    const responseData = {
      utilizator: {
        nume: user.nume,
        email: user.email,
        areAbonamentValabil,
        tipAbonament
      },
      tipuriClase,
      clase: claseFormatate,
      claseUtilizator: claseUtilizatorFormatate,
      perioada: {
        startDate,
        endDate
      }
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Eroare la obținerea claselor:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}

// POST pentru înscriere la clasă
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
    const { clasaId, actiune } = body; // actiune: 'inscriere' sau 'anulare'

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: "Utilizatorul nu a fost găsit" },
        { status: 404 }
      );
    }

    if (user.rol === "membru") {
      interface Abonament {
        status: string;
        dataSfarsit: string | Date;
      }
      const abonamentActiv = user.membru?.abonamente?.find(
        (abonament: Abonament) => 
          abonament.status === "valabil" && 
          new Date(abonament.dataSfarsit) > new Date()
      );
      
      if (!abonamentActiv) {
        return NextResponse.json(
          { error: "Ai nevoie de un abonament valabil pentru a te înscrie la clase" },
          { status: 403 }
        );
      }
    }

    const clasa = await Clasa.findById(clasaId);

    if (!clasa) {
      return NextResponse.json(
        { error: "Clasa nu a fost găsită" },
        { status: 404 }
      );
    }

    if (actiune === 'inscriere') {

      interface Participant {
        id: string | { toString(): string };
        nume: string;
        status: string;
      }
      const dejaInscris = clasa.participanti.some((p: Participant) => p.id.toString() === user._id.toString());
      
      if (dejaInscris) {
        return NextResponse.json(
          { error: "Ești deja înscris la această clasă" },
          { status: 400 }
        );
      }

      if (clasa.participanti.length >= clasa.nrLocuri) {
        return NextResponse.json(
          { error: "Clasa este completă" },
          { status: 400 }
        );
      }

      clasa.participanti.push({
        id: user._id,
        nume: user.nume,
        status: 'inscris'
      });

      await clasa.save();

      return NextResponse.json({
        message: "Te-ai înscris cu succes la clasă!"
      });

    } else if (actiune === 'anulare') {
      interface Participant {
        id: string | { toString(): string };
        nume: string;
        status: string;
      }
      const indexParticipant = clasa.participanti.findIndex((p: Participant) => p.id.toString() === user._id.toString());
      
      if (indexParticipant === -1) {
        return NextResponse.json(
          { error: "Nu ești înscris la această clasă" },
          { status: 400 }
        );
      }

      clasa.participanti.splice(indexParticipant, 1);
      await clasa.save();

      return NextResponse.json({
        message: "Înscrierea a fost anulată cu succes!"
      });
    }

    return NextResponse.json(
      { error: "Acțiune nevalidă" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Eroare la procesarea înscrierii:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}