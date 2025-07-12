import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Nu ești autentificat" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { parolaVeche, parolaNoua } = body;

    if (!parolaVeche || !parolaNoua) {
      return NextResponse.json(
        { error: "Toate câmpurile sunt obligatorii" },
        { status: 400 }
      );
    }

    if (parolaNoua.length < 8) {
      return NextResponse.json(
        { error: "Parola nouă trebuie să aibă cel puțin 8 caractere" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: "Utilizatorul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Verifică dacă utilizatorul are parolă setată (pentru utilizatorii cu Google Auth)
    if (!user.parola) {
      return NextResponse.json(
        { error: "Nu poți schimba parola pentru conturile cu autentificare Google" },
        { status: 400 }
      );
    }

    // Verifică parola veche (comparare simplă)
    if (user.parola !== parolaVeche) {
      return NextResponse.json(
        { error: "Parola veche este incorectă" },
        { status: 400 }
      );
    }

    // Actualizează parola (fără hash)
    await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: { parola: parolaNoua } }
    );

    return NextResponse.json({
      message: "Parola a fost schimbată cu succes"
    });
  } catch (error) {
    console.error("Eroare la schimbarea parolei:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}