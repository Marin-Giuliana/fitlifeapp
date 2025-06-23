import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    if (session.user.role !== "membru" && session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Interzis - Doar membrii și adminii pot accesa aceasta resursa" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const antrenori = await User.find(
      { rol: "antrenor" },
      {
        _id: 1,
        nume: 1,
        email: 1,
        "antrenor.specializari": 1
      }
    );

    const formattedAntrenori = antrenori.map(antrenor => ({
      id: antrenor._id,
      name: antrenor.nume,
      email: antrenor.email,
      specialization: antrenor.antrenor?.specializari?.join(", ") || "Fitness General",
      avatar: "/avatar-placeholder.png",
      rating: 4.8, // Mock rating - you can implement a real rating system later
      experience: "5 ani", // Mock experience - you can add this field to the schema later
      phone: "+40721123456", // Mock phone - you can add this field to the schema later
      description: `Antrenor certificat cu experiență în ${antrenor.antrenor?.specializari?.join(", ") || "fitness general"}.`
    }));

    return NextResponse.json(formattedAntrenori);
  } catch (error) {
    console.error("Eroare la obținerea antrenorilor:", error);
    return NextResponse.json(
      { message: "Eroare de server interna" },
      { status: 500 }
    );
  }
}