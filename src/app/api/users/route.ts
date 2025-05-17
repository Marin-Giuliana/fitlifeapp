import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const rol = searchParams.get("rol");
    const nume = searchParams.get("nume");
    const email = searchParams.get("email");
    const id = searchParams.get("id");

    if (session.user.role !== "admin" && session.user.role !== "antrenor") {
      if (id && id !== session.user.id) {
        return NextResponse.json(
          { message: "Interzis - Puteti accesa doar propriile date" },
          { status: 403 }
        );
      }
      
      if (!session.user.id) {
        return NextResponse.json(
          { message: "ID-ul utilizatorului lipseste din sesiune" },
          { status: 400 }
        );
      }
      return await getSingleUser(session.user.id);
    }

    if (id) {
      return await getSingleUser(id);
    }

    const filter: Record<string, unknown> = {};
    
    if (session.user.role === "antrenor") {
      filter.rol = "membru";
    } 
    else if (rol) {
      filter.rol = rol;
    }
    
    if (nume) filter.nume = { $regex: new RegExp(nume, "i") };
    if (email) filter.email = { $regex: new RegExp(email, "i") };

    const users = await User.find(filter)
      .select("-parola")
      .sort({ nume: 1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Eroare la obtinerea utilizatorilor:", error);
    return NextResponse.json(
      { message: "Eroare de server interna" },
      { status: 500 }
    );
  }
}

async function getSingleUser(userId: string) {
  try {
    const user = await User.findById(userId).select("-parola");
    
    if (!user) {
      return NextResponse.json(
        { message: "Utilizatorul nu a fost gasit" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error("Eroare la obtinerea utilizatorului:", error);
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

    await connectToDatabase();

    const { id, updates } = await req.json();

    if (!id || !updates) {
      return NextResponse.json(
        { message: "Campuri obligatorii lipsa" },
        { status: 400 }
      );
    }

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json(
        { message: "Utilizatorul nu a fost gasit" },
        { status: 404 }
      );
    }

    let updatesToApply = updates;
    
    if (session.user.role === "membru" || session.user.role === "antrenor") {
      if (id !== session.user.id) {
        return NextResponse.json(
          { message: "Interzis - Puteti actualiza doar propriile date" },
          { status: 403 }
        );
      }
      
      const allowedFields = ["nume", "email", "parola", "dataNasterii", "sex"];
      const restrictedUpdate: Record<string, unknown> = {};
      
      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          restrictedUpdate[key] = updates[key];
        }
      });
      
      updatesToApply = restrictedUpdate;
      
      if (updates.rol) {
        return NextResponse.json(
          { message: "Interzis - Nu puteti schimba rolul utilizatorului" },
          { status: 403 }
        );
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updatesToApply },
      { new: true, runValidators: true }
    ).select("-parola");

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Eroare la actualizarea utilizatorului:", error);
    return NextResponse.json(
      { message: "Eroare de server interna" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    let userId = id;
    if (!userId) {
      try {
        const body = await req.json();
        userId = body.id;
      } catch {
      }
    }

    if (!userId) {
      return NextResponse.json(
        { message: "ID-ul utilizatorului este obligatoriu" },
        { status: 400 }
      );
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { message: "Utilizatorul nu a fost gasit" },
        { status: 404 }
      );
    }

    if (userId === session.user.id) {
      return NextResponse.json(
        { message: "Nu puteti sterge propriul cont" },
        { status: 400 }
      );
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json(
      { message: "Utilizatorul a fost sters cu succes" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Eroare la stergerea utilizatorului:", error);
    return NextResponse.json(
      { message: "Eroare de server interna" },
      { status: 500 }
    );
  }
}