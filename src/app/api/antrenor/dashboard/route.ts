import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Clasa from "@/models/Clasa";
import SesiunePrivata from "@/models/SesiunePrivata";

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
    
    if (!user || (user.rol !== "antrenor" && user.rol !== "admin")) {
      return NextResponse.json(
        { error: "Nu ai permisiuni de antrenor" },
        { status: 403 }
      );
    }

    // Obține data de astăzi și limitele săptămânii
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(monday);
    endOfWeek.setDate(monday.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Obține clasele de astăzi
    const claseAstazi = await Clasa.find({
      'antrenor.id': user._id,
      dataClasa: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    }).sort({ oraClasa: 1 });

    // Obține clasele din săptămână
    const claseSaptamana = await Clasa.find({
      'antrenor.id': user._id,
      dataClasa: {
        $gte: monday,
        $lte: endOfWeek
      }
    });

    // Obține sesiunile private de astăzi
    const sesiuniAstazi = await SesiunePrivata.find({
      'antrenor.id': user._id,
      dataSesiune: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    })
    .populate('membru.id', 'nume')
    .sort({ oraSesiune: 1 });

    // Obține sesiunile private programate (viitoare)
    const sesiuniProgramate = await SesiunePrivata.find({
      'antrenor.id': user._id,
      dataSesiune: { $gte: now },
      status: 'confirmata'
    });

    // Obține toți membrii care au sesiuni cu acest antrenor
    const membriSet = new Set();
    const allSesiuni = await SesiunePrivata.find({
      'antrenor.id': user._id
    });
    
    allSesiuni.forEach(sesiune => {
      membriSet.add(sesiune.membru.id.toString());
    });

    // Calculează statistici
    const totalClasePredate = await Clasa.countDocuments({
      'antrenor.id': user._id,
      dataClasa: { $lt: now }
    });

    // Formatează activitățile zilei
    interface ActivitateGrupa {
      id: string;
      tip: 'grupa';
      nume: string;
      ora: string;
      participanti: number;
      maxParticipanti: number;
      status: 'finalizata' | 'programata';
    }

    interface ActivitatePrivata {
      id: string;
      tip: 'privata';
      nume: string;
      ora: string;
      client: string;
      status: string;
    }

    type ActivitateZi = ActivitateGrupa | ActivitatePrivata;

    const activitatiZilei: ActivitateZi[] = [];

    // Adaugă clasele de grup
    claseAstazi.forEach(clasa => {
      activitatiZilei.push({
        id: clasa._id,
        tip: 'grupa',
        nume: clasa.tipClasa,
        ora: clasa.oraClasa,
        participanti: clasa.participanti.length,
        maxParticipanti: clasa.nrLocuri,
        status: clasa.dataClasa < now ? 'finalizata' : 'programata'
      });
    });

    // Adaugă sesiunile private
    sesiuniAstazi.forEach(sesiune => {
      activitatiZilei.push({
        id: sesiune._id,
        tip: 'privata',
        nume: `Personal Training - ${sesiune.membru.nume}`,
        ora: sesiune.oraSesiune,
        client: sesiune.membru.nume,
        status: sesiune.status
      });
    });

    // Sortează activitățile după oră
    activitatiZilei.sort((a, b) => {
      const timeA = a.ora.split(':').map(Number);
      const timeB = b.ora.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });

    const responseData = {
      antrenor: {
        nume: user.nume,
        email: user.email,
        specializari: user.antrenor?.specializari || []
      },
      statistici: {
        membriActivi: membriSet.size,
        claseAstazi: claseAstazi.length,
        claseSaptamana: claseSaptamana.length,
        sesiuniProgramate: sesiuniProgramate.length,
        totalClasePredate,
      },
      activitatiZilei,
      resumeRapid: {
        claseAstazi: claseAstazi.length,
        claseSaptamana: claseSaptamana.length,
        sesiuniProgramate: sesiuniProgramate.length
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Eroare la obținerea dashboard-ului antrenorului:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}