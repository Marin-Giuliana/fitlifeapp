import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Interzis - Permisiuni insuficiente" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { userId, numberOfSessions } = await req.json();

    if (!userId || !numberOfSessions) {
      return NextResponse.json(
        { message: "Campuri obligatorii lipsa" },
        { status: 400 }
      );
    }

    if (isNaN(numberOfSessions) || numberOfSessions <= 0) {
      return NextResponse.json(
        { message: "Numarul de sedinte trebuie sa fie un numar pozitiv" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ 
      _id: userId,
      rol: "membru"
    });

    if (!user) {
      return NextResponse.json(
        { message: "Utilizatorul nu a fost gasit sau nu este membru" },
        { status: 404 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          "membru.sedintePT": numberOfSessions
        }
      },
      { new: true }
    ).select("-parola");

    return NextResponse.json({
      message: `Au fost adaugate ${numberOfSessions} sedinte PT utilizatorului`,
      user: updatedUser
    });
  } catch (error) {
    console.error("Eroare la adaugarea sedintelor PT:", error);
    return NextResponse.json(
      { message: "Eroare de server interna" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Interzis - Permisiuni insuficiente" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { userId, adjustment } = await req.json();

    if (!userId || adjustment === undefined) {
      return NextResponse.json(
        { message: "Campuri obligatorii lipsa" },
        { status: 400 }
      );
    }

    if (isNaN(adjustment)) {
      return NextResponse.json(
        { message: "Ajustarea trebuie sa fie un numar" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ 
      _id: userId,
      rol: "membru"
    });

    if (!user) {
      return NextResponse.json(
        { message: "Utilizatorul nu a fost gasit sau nu este membru" },
        { status: 404 }
      );
    }

    if (user.membru.sedintePT + adjustment < 0) {
      return NextResponse.json(
        { message: "Nu se pot reduce sedintele PT sub zero" },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          "membru.sedintePT": adjustment
        }
      },
      { new: true }
    ).select("-parola");

    const action = adjustment > 0 ? "Adaugate" : "Eliminate";
    const value = Math.abs(adjustment);

    return NextResponse.json({
      message: `${action} ${value} sedinte PT ${adjustment > 0 ? "pentru" : "de la"} utilizator`,
      user: updatedUser
    });
  } catch (error) {
    console.error("Eroare la ajustarea sedintelor PT:", error);
    return NextResponse.json(
      { message: "Eroare de server interna" },
      { status: 500 }
    );
  }
}