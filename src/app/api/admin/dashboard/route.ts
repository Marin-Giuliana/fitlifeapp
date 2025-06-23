import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Clasa from "@/models/Clasa";
import SesiunePrivata from "@/models/SesiunePrivata";
import Echipament from "@/models/Echipament";

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

    // Obține statistici pentru membri
    const totalMembri = await User.countDocuments({ rol: "membru" });
    const antrenoriActivi = await User.countDocuments({ rol: "antrenor" });
    const totalAdmini = await User.countDocuments({ rol: "admin" });
    
    console.log("Statistici de bază:", { totalMembri, antrenoriActivi, totalAdmini });

    // Distribuția pe gen - includem toți userii care au câmpul sex, indiferent de rol
    const genDistribution = await User.aggregate([
      { $match: { sex: { $exists: true, $nin: [null, ""] } } },
      { $group: { _id: "$sex", count: { $sum: 1 } } }
    ]);
    
    console.log("Distribuție gen din aggregation (toți userii cu sex):", genDistribution);
    
    let membriMasculin = 0;
    let membriFeminin = 0;
    
    genDistribution.forEach(item => {
      const sex = item._id;
      if (sex && (sex.toLowerCase().includes('m') || sex.toLowerCase().includes('masculin') || sex.toLowerCase().includes('barbat'))) {
        membriMasculin += item.count;
      } else if (sex && (sex.toLowerCase().includes('f') || sex.toLowerCase().includes('feminin') || sex.toLowerCase().includes('femeie'))) {
        membriFeminin += item.count;
      }
    });
    
    console.log("Distribuție calculată:", { membriMasculin, membriFeminin });

    // Statistici clase
    const totalClase = await Clasa.countDocuments();
    const totalSesiuniPrivate = await SesiunePrivata.countDocuments();
    
    // Echipamente
    const totalEchipamente = await Echipament.countDocuments();
    const echipamenteFunctionale = await Echipament.countDocuments({ stare: "functional" });
    const echipamenteDefecte = await Echipament.countDocuments({ 
      $or: [{ stare: "defect" }, { stare: "service" }] 
    });

    // Clase și calcul ore de vârf (ultimele 7 zile)
    const acum = new Date();
    const saptamanaAcesta = new Date(acum.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const claseRecente = await Clasa.find({
      dataClasa: { $gte: saptamanaAcesta }
    }).populate('antrenor.id', 'nume').sort({ dataClasa: -1 }).limit(5);

    // Calculează ocuparea medie pentru clase
    const claseOcupare = await Clasa.find({ dataClasa: { $gte: saptamanaAcesta } });
    const ocupareMedie = claseOcupare.length > 0 
      ? Math.round(claseOcupare.reduce((sum, clasa) => 
          sum + (clasa.participanti.length / clasa.nrLocuri * 100), 0) / claseOcupare.length)
      : 0;

    // Calculul veniturilor pe baza abonamentelor active (data sfârșit > data prezentă)
    console.log("Analizez abonamente active cu data sfârșitul > data prezentă:", acum);

    // Folosim aggregation pentru a analiza abonamentele care nu au expirat
    // Includem toți userii care au abonamente, indiferent de rol (ca în exemplul tău - admin cu abonamente)
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
          count: { $sum: 1 },
          abonamente: { $push: "$membru.abonamente" },
          users: { $push: { nume: "$nume", rol: "$rol", status: "$membru.abonamente.status" } }
        }
      }
    ]);

    console.log("Abonamente active (dataSfarsit > acum):", abonamenteAnalysis);

    const pretAbonamente = {
      "Standard": 150,
      "Standard+": 250,
      "Premium": 400
    };

    let venitLunar = 0;
    let abonamenteStandard = 0;
    let abonamenteStandardPlus = 0;
    let abonamentePremium = 0;

    abonamenteAnalysis.forEach(group => {
      const tipAbonament = group._id;
      const numarAbonamente = group.count;
      const pret = pretAbonamente[tipAbonament as keyof typeof pretAbonamente] || 0;
      
      venitLunar += numarAbonamente * pret;
      
      if (tipAbonament === "Standard") abonamenteStandard = numarAbonamente;
      else if (tipAbonament === "Standard+") abonamenteStandardPlus = numarAbonamente;
      else if (tipAbonament === "Premium") abonamentePremium = numarAbonamente;
    });

    console.log("Venituri finale calculate (abonamente cu dataSfarsit > acum):", { 
      venitLunar, 
      abonamenteStandard, 
      abonamenteStandardPlus, 
      abonamentePremium,
      totalAbonamenteActive: abonamenteStandard + abonamenteStandardPlus + abonamentePremium,
      dataAnaliza: acum
    });

    // Calculul orelor de vârf pe baza claselor programate
    type OreVarf = {
      [ora: string]: { clase: number; ocupare: number };
    };
    const oreVarf: OreVarf = {};
    claseOcupare.forEach(clasa => {
      const ora = clasa.oraClasa.substring(0, 2); // Extrage ora (ex: "18" din "18:30")
      if (!oreVarf[ora]) oreVarf[ora] = { clase: 0, ocupare: 0 };
      oreVarf[ora].clase++;
      oreVarf[ora].ocupare += (clasa.participanti.length / clasa.nrLocuri * 100);
    });

    // Găsește ora cu cea mai mare activitate
    let oraCeaMaiActiva = "18:00-20:00";
    let ocupareMaxima = 0;
    Object.keys(oreVarf).forEach(ora => {
      const ocupareMedieOra = oreVarf[ora].ocupare / oreVarf[ora].clase;
      if (ocupareMedieOra > ocupareMaxima) {
        ocupareMaxima = ocupareMedieOra;
        oraCeaMaiActiva = `${ora}:00-${parseInt(ora) + 2}:00`;
      }
    });

    interface AdminInfo {
      nume: string;
      email: string;
      initials: string;
    }

    interface Statistici {
      totalMembri: number;
      antrenoriActivi: number;
      totalAdmini: number;
      totalClase: number;
      totalSesiuniPrivate: number;
      totalEchipamente: number;
      echipamenteFunctionale: number;
      echipamenteDefecte: number;
      ocupareMedie: number;
      crestereMembriFeminin: number;
      crescereMembriMasculin: number;
      procentajFemei: number;
      procentajBarbati: number;
      venitLunar: number;
      abonamenteStandard: number;
      abonamenteStandardPlus: number;
      abonamentePremium: number;
    }

    interface DistributieOra {
      interval: string;
      ocupare: number;
      numarClase: number;
    }

    interface OreVarfInfo {
      oraPrincipala: string;
      ocupareMaxima: number;
      distributieOre: DistributieOra[];
    }

    interface ClasaRecenteInfo {
      id: string;
      tipClasa: string;
      dataClasa: Date;
      oraClasa: string;
      antrenor: string;
      participanti: number;
      nrLocuri: number;
    }

    interface ResponseData {
      admin: AdminInfo;
      statistici: Statistici;
      oreVarf: OreVarfInfo;
      claseRecente: ClasaRecenteInfo[];
    }

    const responseData: ResponseData = {
      admin: {
      nume: user.nume,
      email: user.email,
      initials: user.nume ? user.nume.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'AD'
      },
      statistici: {
      totalMembri,
      antrenoriActivi,
      totalAdmini,
      totalClase,
      totalSesiuniPrivate,
      totalEchipamente,
      echipamenteFunctionale,
      echipamenteDefecte,
      ocupareMedie,
      crestereMembriFeminin: membriFeminin,
      crescereMembriMasculin: membriMasculin,
      procentajFemei: totalMembri > 0 ? Math.round((membriFeminin / totalMembri) * 100) : 0,
      procentajBarbati: totalMembri > 0 ? Math.round((membriMasculin / totalMembri) * 100) : 0,
      venitLunar,
      abonamenteStandard,
      abonamenteStandardPlus,
      abonamentePremium
      },
      oreVarf: {
      oraPrincipala: oraCeaMaiActiva,
      ocupareMaxima: Math.round(ocupareMaxima),
      distributieOre: Object.keys(oreVarf).map((ora: string) => ({
        interval: `${ora}:00-${parseInt(ora) + 1}:00`,
        ocupare: Math.round(oreVarf[ora].ocupare / oreVarf[ora].clase) || 0,
        numarClase: oreVarf[ora].clase
      })).sort((a, b) => b.ocupare - a.ocupare)
      },
      claseRecente: claseRecente.map((clasa: ClasaRecenteInfo): ClasaRecenteInfo => ({
      id: clasa.id,
      tipClasa: clasa.tipClasa,
      dataClasa: clasa.dataClasa,
      oraClasa: clasa.oraClasa,
      antrenor: clasa.antrenor,
      participanti: clasa.participanti,
      nrLocuri: clasa.nrLocuri
      }))
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Eroare la obținerea datelor dashboard admin:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}