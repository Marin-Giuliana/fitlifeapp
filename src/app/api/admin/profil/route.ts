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
      "nume email dataNasterii sex rol"
    );

    if (!user) {
      return NextResponse.json(
        { error: "Utilizatorul nu a fost găsit" },
        { status: 404 }
      );
    }

    if (user.rol !== "admin") {
      return NextResponse.json(
        { error: "Nu ai permisiuni de administrator" },
        { status: 403 }
      );
    }

    const profileData = {
      nume: user.nume,
      email: user.email,
      dataNasterii: user.dataNasterii,
      sex: user.sex,
      rol: user.rol
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Eroare la obținerea profilului admin:", error);
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
    const { nume, dataNasterii, sex } = body;

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: "Utilizatorul nu a fost găsit" },
        { status: 404 }
      );
    }

    if (user.rol !== "admin") {
      return NextResponse.json(
        { error: "Nu ai permisiuni de administrator" },
        { status: 403 }
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          nume,
          dataNasterii: dataNasterii ? new Date(dataNasterii) : undefined,
          sex
        }
      },
      { new: true, runValidators: true }
    ).select("nume email dataNasterii sex rol");

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
        rol: updatedUser.rol
      }
    });
  } catch (error) {
    console.error("Eroare la actualizarea profilului admin:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}