import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

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

    const user = await User.findOne({ email: session.user.email }).select(
      "nume email rol membru.abonamente membru.sedintePT"
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
        { error: "Nu ai permisiuni să accesezi abonamentele" },
        { status: 403 }
      );
    }

    const areDateMembru = user.membru && (user.membru.abonamente || user.membru.sedintePT !== undefined);
    
    if ((user.rol === "admin" || user.rol === "antrenor") && !areDateMembru) {
      const abonamentData = {
        utilizator: {
          nume: user.nume,
          email: user.email
        },
        abonamentCurent: null,
        sedintePT: {
          disponibile: 0
        },
        istoricAbonamente: []
      };
      return NextResponse.json(abonamentData);
    }

    
    const abonamentActiv = user.membru?.abonamente?.find(
      (abonament: { status: string; dataSfarsit: string; dataInceput: string; tipAbonament: string }) => 
        abonament.status === "valabil" && 
        new Date(abonament.dataSfarsit) > new Date()
    );

    let abonamentCurent = null;
    if (abonamentActiv) {
      const dataInceput = new Date(abonamentActiv.dataInceput);
      const dataSfarsit = new Date(abonamentActiv.dataSfarsit);
      const acum = new Date();

      const zileTotale = Math.ceil((dataSfarsit.getTime() - dataInceput.getTime()) / (1000 * 60 * 60 * 24));
      const zileleRamase = Math.max(0, Math.ceil((dataSfarsit.getTime() - acum.getTime()) / (1000 * 60 * 60 * 24)));
      
      const progres = Math.min(100, Math.round(((zileTotale - zileleRamase) / zileTotale) * 100));

      abonamentCurent = {
        tipAbonament: abonamentActiv.tipAbonament,
        dataInceput: abonamentActiv.dataInceput,
        dataSfarsit: abonamentActiv.dataSfarsit,
        status: abonamentActiv.status,
        zileleRamase,
        zileTotale,
        progres
      };
    }

    type Abonament = {
      tipAbonament: string;
      dataInceput: string;
      dataSfarsit: string;
      status: string;
    };

    const istoricAbonamente = user.membru?.abonamente
      ?.map((abonament: Abonament) => ({
        tipAbonament: abonament.tipAbonament,
        dataInceput: abonament.dataInceput,
        dataSfarsit: abonament.dataSfarsit,
        status: abonament.status
      }))
      .sort((a: Abonament, b: Abonament) => new Date(b.dataInceput).getTime() - new Date(a.dataInceput).getTime()) || [];

    const abonamentData = {
      utilizator: {
        nume: user.nume,
        email: user.email
      },
      abonamentCurent,
      sedintePT: {
        disponibile: user.membru?.sedintePT || 0
      },
      istoricAbonamente
    };

    return NextResponse.json(abonamentData);
  } catch (error) {
    console.error("Eroare la obținerea datelor abonament:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}