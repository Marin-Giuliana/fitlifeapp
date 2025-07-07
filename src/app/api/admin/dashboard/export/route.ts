import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Clasa from "@/models/Clasa";
import SesiunePrivata from "@/models/SesiunePrivata";
import Echipament from "@/models/Echipament";
// Use CSV format instead of Excel for better compatibility

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

    if (!user || user.rol !== "admin") {
      return NextResponse.json(
        { error: "Nu ai permisiuni de administrator" },
        { status: 403 }
      );
    }

    // Obține toate statisticile
    const totalMembri = await User.countDocuments({ rol: "membru" });
    const antrenoriActivi = await User.countDocuments({ rol: "antrenor" });
    const totalAdmini = await User.countDocuments({ rol: "admin" });

    // Distribuția pe gen
    const genDistribution = await User.aggregate([
      { $match: { rol: "membru", sex: { $exists: true, $nin: [null, ""] } } },
      { $group: { _id: "$sex", count: { $sum: 1 } } }
    ]);
    
    let membriMasculin = 0;
    let membriFeminin = 0;
    
    genDistribution.forEach(item => {
      const sex = item._id;
      if (sex === 'masculin') {
        membriMasculin += item.count;
      } else if (sex === 'feminin') {
        membriFeminin += item.count;
      }
    });

    // Statistici clase și sesiuni
    const totalClase = await Clasa.countDocuments();
    const totalSesiuniPrivate = await SesiunePrivata.countDocuments();
    
    // Echipamente
    const totalEchipamente = await Echipament.countDocuments();
    const echipamenteFunctionale = await Echipament.countDocuments({ stare: "functional" });
    const echipamenteDefecte = await Echipament.countDocuments({ 
      $or: [{ stare: "defect" }, { stare: "service" }] 
    });

    // Abonamente active
    const acum = new Date();
    const abonamenteAnalysis = await User.aggregate([
      { $match: { "membru.abonamente": { $exists: true, $ne: [] } } },
      { $unwind: "$membru.abonamente" },
      { 
        $match: {
          "membru.abonamente.dataSfarsit": { $gt: acum }
        }
      },
      {
        $group: {
          _id: "$membru.abonamente.tipAbonament",
          count: { $sum: 1 }
        }
      }
    ]);

    let venitLunar = 0;
    let abonamenteStandard = 0;
    let abonamenteStandardPlus = 0;
    let abonamentePremium = 0;

    const pretAbonamente = {
      "Standard": 150,
      "Standard+": 250,
      "Premium": 400
    };

    abonamenteAnalysis.forEach(group => {
      const tipAbonament = group._id;
      const numarAbonamente = group.count;
      const pret = pretAbonamente[tipAbonament as keyof typeof pretAbonamente] || 0;
      
      venitLunar += numarAbonamente * pret;
      
      if (tipAbonament === "Standard") abonamenteStandard = numarAbonamente;
      else if (tipAbonament === "Standard+") abonamenteStandardPlus = numarAbonamente;
      else if (tipAbonament === "Premium") abonamentePremium = numarAbonamente;
    });

    // Calculul ocupării medii
    const saptamanaAcesta = new Date(acum.getTime() - 7 * 24 * 60 * 60 * 1000);
    const claseOcupare = await Clasa.find({ dataClasa: { $gte: saptamanaAcesta } });
    const ocupareMedie = claseOcupare.length > 0 
      ? Math.round(claseOcupare.reduce((sum, clasa) => 
          sum + (clasa.participanti.length / clasa.nrLocuri * 100), 0) / claseOcupare.length)
      : 0;

    // Creează raportul CSV complet
    let csvContent = '';

    // Secțiunea 1: Statistici Generale
    csvContent += "STATISTICI GENERALE\n";
    csvContent += "Statistică,Valoare\n";
    csvContent += `Total Membri,${totalMembri}\n`;
    csvContent += `Antrenori Activi,${antrenoriActivi}\n`;
    csvContent += `Total Administratori,${totalAdmini}\n`;
    csvContent += `Total Clase,${totalClase}\n`;
    csvContent += `Total Sesiuni Private,${totalSesiuniPrivate}\n`;
    csvContent += `Ocupare Medie (%),${ocupareMedie}\n`;
    csvContent += `Venit Lunar (RON),${venitLunar}\n\n`;

    // Secțiunea 2: Demografia Membrilor
    csvContent += "DEMOGRAFIA MEMBRILOR\n";
    csvContent += "Gen,Număr,Procent (%)\n";
    csvContent += `Femei,${membriFeminin},${totalMembri > 0 ? Math.round((membriFeminin / totalMembri) * 100) : 0}\n`;
    csvContent += `Bărbați,${membriMasculin},${totalMembri > 0 ? Math.round((membriMasculin / totalMembri) * 100) : 0}\n`;
    csvContent += `Total,${membriFeminin + membriMasculin},100\n\n`;

    // Secțiunea 3: Abonamente
    csvContent += "ABONAMENTE\n";
    csvContent += "Tip Abonament,Număr Abonamente,Preț (RON),Venit Total (RON)\n";
    csvContent += `Standard,${abonamenteStandard},150,${abonamenteStandard * 150}\n`;
    csvContent += `Standard+,${abonamenteStandardPlus},250,${abonamenteStandardPlus * 250}\n`;
    csvContent += `Premium,${abonamentePremium},400,${abonamentePremium * 400}\n`;
    csvContent += `TOTAL,${abonamenteStandard + abonamenteStandardPlus + abonamentePremium},-,${venitLunar}\n\n`;

    // Secțiunea 4: Echipamente
    csvContent += "ECHIPAMENTE\n";
    csvContent += "Stare,Număr,Procent (%)\n";
    csvContent += `Funcționale,${echipamenteFunctionale},${Math.round((echipamenteFunctionale / totalEchipamente) * 100) || 0}\n`;
    csvContent += `Necesită Atenție,${echipamenteDefecte},${Math.round((echipamenteDefecte / totalEchipamente) * 100) || 0}\n`;
    csvContent += `Total,${totalEchipamente},100\n`;

    // Returnează fișierul CSV
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="raport-dashboard-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error("Eroare la generarea raportului Excel:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}