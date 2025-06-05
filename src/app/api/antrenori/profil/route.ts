import { NextRequest, NextResponse } from "next/server";
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
      "nume email dataNasterii sex antrenor.dataAngajarii antrenor.specializari rol"
    );

    if (!user) {
      return NextResponse.json(
        { error: "Utilizatorul nu a fost găsit" },
        { status: 404 }
      );
    }

    if (user.rol !== "antrenor" && user.rol !== "admin") {
      return NextResponse.json(
        { error: "Nu ai permisiuni de antrenor" },
        { status: 403 }
      );
    }

    const profileData = {
      nume: user.nume,
      email: user.email,
      dataNasterii: user.dataNasterii,
      sex: user.sex,
      dataAngajarii: user.antrenor?.dataAngajarii,
      specializari: user.antrenor?.specializari || []
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Eroare la obținerea profilului antrenor:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}

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
    const { nume, dataNasterii, sex, dataAngajarii, specializari } = body;

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: "Utilizatorul nu a fost găsit" },
        { status: 404 }
      );
    }

    if (user.rol !== "antrenor" && user.rol !== "admin") {
      return NextResponse.json(
        { error: "Nu ai permisiuni de antrenor" },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {
      nume,
      dataNasterii: dataNasterii ? new Date(dataNasterii) : undefined,
      sex
    };

    if (dataAngajarii || specializari) {
      updateData["antrenor.dataAngajarii"] = dataAngajarii ? new Date(dataAngajarii) : undefined;
      updateData["antrenor.specializari"] = specializari;
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("nume email dataNasterii sex antrenor.dataAngajarii antrenor.specializari");

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Utilizatorul nu a fost găsit" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Profilul a fost actualizat cu succes",
      user: {
        nume: updatedUser.nume,
        email: updatedUser.email,
        dataNasterii: updatedUser.dataNasterii,
        sex: updatedUser.sex,
        dataAngajarii: updatedUser.antrenor?.dataAngajarii,
        specializari: updatedUser.antrenor?.specializari
      }
    });
  } catch (error) {
    console.error("Eroare la actualizarea profilului antrenor:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}