import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Obține toți userii pentru debug
    const allUsers = await User.find({}).limit(20);
    
    // Analiză distribuție pe gen
    const genStats = await User.aggregate([
      { $match: { rol: "membru" } },
      { $group: { _id: "$sex", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Analiză abonamente
    const abonamenteStats = await User.aggregate([
      { $match: { rol: "membru", "membru.abonamente": { $exists: true, $ne: [] } } },
      { $unwind: "$membru.abonamente" },
      { $group: { 
          _id: "$membru.abonamente.tipAbonament", 
          count: { $sum: 1 },
          status: { $push: "$membru.abonamente.status" },
          dataInceput: { $push: "$membru.abonamente.dataInceput" },
          dataSfarsit: { $push: "$membru.abonamente.dataSfarsit" }
        }
      }
    ]);

    // Verifică structura datelor
    const sampleUsers = await User.find({ rol: "membru" }).limit(5).select('nume sex membru');

    return NextResponse.json({
      totalUsers: allUsers.length,
      sampleUsers: sampleUsers.map(u => ({
        nume: u.nume,
        sex: u.sex,
        sexType: typeof u.sex,
        hasAbonamente: u.membru?.abonamente?.length || 0,
        abonamente: u.membru?.abonamente || []
      })),
      genStats,
      abonamenteStats,
      rawData: {
        allSexValues: allUsers.map(u => u.sex).filter(Boolean),
        allRoles: allUsers.map(u => u.rol)
      }
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}