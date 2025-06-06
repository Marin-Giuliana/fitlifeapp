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
      "nume email rol membru.abonamente membru.sedintePT membru.dataInregistrare"
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
        { error: "Nu ai permisiuni să accesezi dashboard-ul" },
        { status: 403 }
      );
    }

    const areDateMembru = user.membru && (user.membru.abonamente || user.membru.sedintePT !== undefined);
    
    if ((user.rol === "admin" || user.rol === "antrenor") && !areDateMembru) {
      const dashboardData = {
        utilizator: {
          nume: user.nume,
          email: user.email,
          dataInregistrare: new Date()
        },
        abonament: null,
        sedintePT: {
          disponibile: 0
        },
        statistici: {
          totalClase: 0,
          participariClase: 0,
          progresAbonament: 0
        }
      };
      return NextResponse.json(dashboardData);
    }

    type Abonament = {
      tipAbonament: string;
      dataInceput: string | Date;
      dataSfarsit: string | Date;
      status: string;
    };

    const abonamentActiv = user.membru?.abonamente?.find(
      (abonament: Abonament) => 
        abonament.status === "valabil" && 
        new Date(abonament.dataSfarsit) > new Date()
    );

    let progresAbonament = 0;
    let zileleRamase = 0;
    let zileTotale = 0;

    if (abonamentActiv) {
      const dataInceput = new Date(abonamentActiv.dataInceput);
      const dataSfarsit = new Date(abonamentActiv.dataSfarsit);
      const acum = new Date();

      zileTotale = Math.ceil((dataSfarsit.getTime() - dataInceput.getTime()) / (1000 * 60 * 60 * 24));
      zileleRamase = Math.ceil((dataSfarsit.getTime() - acum.getTime()) / (1000 * 60 * 60 * 24));
      
      if (zileleRamase < 0) zileleRamase = 0;
      
      progresAbonament = Math.round(((zileTotale - zileleRamase) / zileTotale) * 100);
      if (progresAbonament > 100) progresAbonament = 100;
    }


    const totalClase = 0;
    const participariClase = 0;

    const dashboardData = {
      utilizator: {
        nume: user.nume,
        email: user.email,
        dataInregistrare: user.membru?.dataInregistrare
      },
      abonament: abonamentActiv ? {
        tipAbonament: abonamentActiv.tipAbonament,
        dataInceput: abonamentActiv.dataInceput,
        dataSfarsit: abonamentActiv.dataSfarsit,
        status: abonamentActiv.status,
        zileleRamase,
        progres: progresAbonament
      } : null,
      sedintePT: {
        disponibile: user.membru?.sedintePT || 0
      },
      statistici: {
        totalClase,
        participariClase,
        progresAbonament: abonamentActiv ? progresAbonament : 0
      }
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Eroare la obținerea datelor dashboard membru:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}