import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Clasa from "@/models/Clasa";
import SesiunePrivata from "@/models/SesiunePrivata";

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
    
    console.log("User found:", user ? {
      nume: user.nume,
      email: user.email,
      rol: user.rol
    } : "No user found");

    if (!user) {
      return NextResponse.json(
        { error: "Utilizatorul nu a fost găsit în baza de date" },
        { status: 404 }
      );
    }

    if (user.rol !== "antrenor" && user.rol !== "admin") {
      return NextResponse.json(
        { error: `Nu ai permisiuni de antrenor. Rolul tău actual: ${user.rol}` },
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

    // Obține clasele de grup pentru antrenor în săptămâna selectată
    const claseGrup = await Clasa.find({
      'antrenor.id': user._id,
      dataClasa: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ dataClasa: 1, oraClasa: 1 });

    // Obține sesiunile private pentru antrenor în săptămâna selectată
    const sesiuniPrivate = await SesiunePrivata.find({
      'antrenor.id': user._id,
      dataSesiune: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .populate('membru.id', 'nume')
    .sort({ dataSesiune: 1, oraSesiune: 1 });

    // Mapează tipurile de clase
    const tipuriClase = [
      { id: 1, name: "Pilates", color: "bg-pink-500" },
      { id: 2, name: "Yoga", color: "bg-purple-500" },
      { id: 3, name: "Spinning", color: "bg-blue-500" },
      { id: 4, name: "Zumba", color: "bg-yellow-500" },
      { id: 5, name: "Crossfit", color: "bg-red-500" },
      { id: 6, name: "Body Pump", color: "bg-green-500" },
    ];

    // Formatează clasele de grup
    const claseFormatate = claseGrup.map(clasa => {
      const tipClasa = tipuriClase.find(tip => tip.name === clasa.tipClasa) || tipuriClase[0];
      
      // Determină statusul clasei
      let status = "scheduled";
      const now = new Date();
      
      // Combină data și ora clasei
      const clasaDateTime = new Date(`${clasa.dataClasa.toISOString().split('T')[0]}T${clasa.oraClasa}:00`);
      
      // Adaugă durata clasei (presupunem 60 de minute)
      const clasaEndTime = new Date(clasaDateTime.getTime() + (60 * 60 * 1000));
      
      // Verifică dacă clasa a fost finalizată manual
      interface Participant {
        id: string;
        nume: string;
        status: string;
      }
      const hasAnyPresent = clasa.participanti.some((p: Participant) => p.status === 'prezent');
      
      if (hasAnyPresent) {
        // Dacă a fost finalizată manual
        status = "completed";
      } else if (clasaEndTime < now) {
        // Dacă timpul clasei + durata au trecut, marchează automat ca finalizată
        status = "completed";
      } else {
        // Clasă viitoare sau în desfășurare
        status = "scheduled";
      }
      
      return {
        id: clasa._id,
        type: "group",
        classTypeId: tipClasa.id,
        classTypeName: tipClasa.name,
        classTypeColor: tipClasa.color,
        date: clasa.dataClasa,
        time: clasa.oraClasa,
        duration: 60, // Default 60 minute
        participants: clasa.participanti.length,
        maxParticipants: clasa.nrLocuri,
        status: status,
        location: "Sala 1" // Default location, se poate adăuga în model în viitor
      };
    });

    // Formatează sesiunile private
    const sesiuniFormatate = sesiuniPrivate.map(sesiune => {
      const now = new Date();
      
      // Combină data și ora sesiunii
      const sesiuneDateTime = new Date(`${sesiune.dataSesiune.toISOString().split('T')[0]}T${sesiune.oraSesiune}:00`);
      
      // Adaugă durata sesiunii
      const durata = sesiune.durata || 60; // minute
      const sesiuneEndTime = new Date(sesiuneDateTime.getTime() + (durata * 60 * 1000));
      
      // Mapează statusul din baza de date la statusul din UI
      let status = "scheduled";
      if (sesiune.status === "finalizata") {
        status = "completed";
      } else if (sesiune.status === "anulata") {
        status = "cancelled";
      } else if (sesiune.status === "confirmata") {
        // Verifică dacă sesiunea + durata au trecut
        if (sesiuneEndTime < now) {
          status = "completed";
        } else {
          status = "scheduled";
        }
      }
      
      return {
        id: sesiune._id,
        type: "private",
        date: sesiune.dataSesiune,
        time: sesiune.oraSesiune,
        duration: durata,
        status: status,
        client: {
          id: sesiune.membru.id._id,
          name: sesiune.membru.nume,
          avatar: "/avatar-placeholder.png"
        },
        location: "Sala PT 1" // Default location pentru sesiuni private
      };
    });

    // Combină toate sesiunile și sortează după dată
    const toateSesiunile = [...claseFormatate, ...sesiuniFormatate]
      .sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateA.getTime() - dateB.getTime();
      });

    // Calculează statistici
    const totalSesiuni = toateSesiunile.length;
    const sesiuniFinalizate = toateSesiunile.filter(s => s.status === "completed").length;
    const claseGrupNr = claseFormatate.length;
    const sesiuniPrivateNr = sesiuniFormatate.length;

    const responseData = {
      antrenor: {
        nume: user.nume,
        email: user.email,
        specializari: user.antrenor?.specializari || []
      },
      sesiuni: toateSesiunile,
      tipuriClase,
      perioada: {
        startDate,
        endDate
      },
      statistici: {
        totalSesiuni,
        sesiuniFinalizate,
        claseGrup: claseGrupNr,
        sesiuniPrivate: sesiuniPrivateNr
      }
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Eroare la obținerea orarului antrenorului:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}

// POST pentru marcarea unei sesiuni ca finalizată
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
    const { sesiuneId, tip, actiune } = body; // tip: 'group' sau 'private', actiune: 'complete'

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });

    if (!user || (user.rol !== "antrenor" && user.rol !== "admin")) {
      return NextResponse.json(
        { error: "Nu ai permisiuni de antrenor" },
        { status: 403 }
      );
    }

    if (actiune === 'complete') {
      if (tip === 'group') {
        // Marchează clasa de grup ca finalizată
        const clasa = await Clasa.findById(sesiuneId);
        
        if (!clasa) {
          return NextResponse.json(
            { error: "Clasa nu a fost găsită" },
            { status: 404 }
          );
        }

        if (clasa.antrenor.id.toString() !== user._id.toString()) {
          return NextResponse.json(
            { error: "Nu ai permisiuni pentru această clasă" },
            { status: 403 }
          );
        }

        // Verifică dacă clasa este în viitor
        const now = new Date();
        const clasaDateTime = new Date(`${clasa.dataClasa.toISOString().split('T')[0]}T${clasa.oraClasa}:00`);
        
        if (clasaDateTime > now) {
          return NextResponse.json(
            { error: "Nu poți finaliza clase din viitor" },
            { status: 400 }
          );
        }

        // Marchează toți participanții înscriși ca prezenți (pentru a finaliza clasa)
        interface Participant {
          id: string;
          nume: string;
          status: string;
        }
        
        // Verifică dacă clasa nu a fost deja finalizată
        const hasAnyPresent = clasa.participanti.some((p: Participant) => p.status === 'prezent');
        
        if (!hasAnyPresent) {
          // Marchează toți participanții înscriși ca prezenți
          clasa.participanti.forEach((participant: Participant) => {
            if (participant.status === 'inscris') {
              participant.status = 'prezent';
            }
          });

          await clasa.save();
        }

        return NextResponse.json({
          message: "Clasa a fost marcată ca finalizată!"
        });

      } else if (tip === 'private') {
        // Marchează sesiunea privată ca finalizată
        const sesiune = await SesiunePrivata.findById(sesiuneId);
        
        if (!sesiune) {
          return NextResponse.json(
            { error: "Sesiunea nu a fost găsită" },
            { status: 404 }
          );
        }

        if (sesiune.antrenor.id.toString() !== user._id.toString()) {
          return NextResponse.json(
            { error: "Nu ai permisiuni pentru această sesiune" },
            { status: 403 }
          );
        }

        // Verifică dacă sesiunea este în viitor
        const now = new Date();
        const sesiuneDateTime = new Date(`${sesiune.dataSesiune.toISOString().split('T')[0]}T${sesiune.oraSesiune}:00`);
        
        if (sesiuneDateTime > now) {
          return NextResponse.json(
            { error: "Nu poți finaliza sesiuni din viitor" },
            { status: 400 }
          );
        }

        sesiune.status = 'finalizata';
        await sesiune.save();

        return NextResponse.json({
          message: "Sesiunea privată a fost marcată ca finalizată!"
        });
      }
    }

    return NextResponse.json(
      { error: "Acțiune nevalidă" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Eroare la actualizarea sesiunii:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}