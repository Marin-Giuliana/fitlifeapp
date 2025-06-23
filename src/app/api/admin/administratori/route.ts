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

    const user = await User.findOne({ email: session.user.email });
    
    if (!user || user.rol !== "admin") {
      return NextResponse.json(
        { error: "Nu ai permisiuni de administrator" },
        { status: 403 }
      );
    }

    // Găsește toți administratorii
    const administratori = await User.find({ 
      rol: "admin" 
    }).select('nume email dataNasterii sex');

    // Găsește toți membrii și antrenorii care pot fi promovați la administrator
    const membri = await User.find({ 
      rol: { $in: ["membru", "antrenor"] }
    }).select('nume email rol');

    // Formatează datele administratorilor
    const administratoriFormatati = administratori.map(admin => ({
      id: admin._id,
      nume: admin.nume,
      email: admin.email,
      telefon: "Nu este specificat",
      dataNasterii: admin.dataNasterii,
      sex: admin.sex,
      dataInregistrare: new Date(),
      permisiuni: [],
      ultimaActivitate: new Date(),
      status: "activ",
      rol: "administrator",
      departament: "General"
    }));

    // Calculează statistici
    const statistici = {
      totalAdministratori: administratoriFormatati.length,
      administratoriActivi: administratoriFormatati.filter(a => a.status === "activ").length,
      administratoriInactivi: administratoriFormatati.filter(a => a.status === "inactiv").length,
      ultimaLuna: 0
    };

    // Formatează datele membrilor și antrenorilor
    const membriFormatati = membri.map(membru => ({
      id: membru._id,
      nume: membru.nume,
      email: membru.email,
      rol: membru.rol
    }));

    return NextResponse.json({
      administratori: administratoriFormatati,
      membri: membriFormatati,
      statistici
    });

  } catch (error) {
    console.error("Eroare la obținerea administratorilor:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { action, adminId, updateData, newAdminData, membruId } = body;

    if (action === "create") {
      // Verifică că nu există deja un user cu acest email
      const existingUser = await User.findOne({ email: newAdminData.email });
      
      if (existingUser) {
        return NextResponse.json(
          { error: "Există deja un utilizator cu acest email" },
          { status: 400 }
        );
      }

      // Creează noul administrator
      const newAdmin = new User({
        nume: newAdminData.nume,
        email: newAdminData.email,
        parola: newAdminData.parola, // Ar trebui să fie hash-uită
        telefon: newAdminData.telefon,
        dataNasterii: newAdminData.dataNasterii,
        sex: newAdminData.sex,
        rol: "admin",
        dataInregistrare: new Date(),
        admin: {
          permisiuni: newAdminData.permisiuni || [],
          status: "activ",
          rol: newAdminData.rol || "administrator",
          departament: newAdminData.departament || "General",
          ultimaActivitate: new Date()
        }
      });

      await newAdmin.save();

      return NextResponse.json({
        message: "Administratorul a fost creat cu succes!",
        administrator: {
          id: newAdmin._id,
          nume: newAdmin.nume,
          email: newAdmin.email,
          telefon: newAdmin.telefon,
          permisiuni: newAdmin.admin.permisiuni,
          status: newAdmin.admin.status,
          rol: newAdmin.admin.rol,
          departament: newAdmin.admin.departament
        }
      });
    }

    if (action === "update") {
      const admin = await User.findById(adminId);
      
      if (!admin || admin.rol !== "admin") {
        return NextResponse.json(
          { error: "Administratorul nu a fost găsit" },
          { status: 404 }
        );
      }

      // Actualizează datele administratorului
      if (updateData.nume) admin.nume = updateData.nume;
      if (updateData.email) admin.email = updateData.email;
      if (updateData.telefon) admin.telefon = updateData.telefon;
      
      if (updateData.admin) {
        if (!admin.admin) admin.admin = {};
        if (updateData.admin.permisiuni) admin.admin.permisiuni = updateData.admin.permisiuni;
        if (updateData.admin.status) admin.admin.status = updateData.admin.status;
        if (updateData.admin.rol) admin.admin.rol = updateData.admin.rol;
        if (updateData.admin.departament) admin.admin.departament = updateData.admin.departament;
      }

      await admin.save();

      return NextResponse.json({
        message: "Administratorul a fost actualizat cu succes!",
        administrator: {
          id: admin._id,
          nume: admin.nume,
          email: admin.email,
          telefon: admin.telefon,
          permisiuni: admin.admin?.permisiuni || [],
          status: admin.admin?.status || "activ",
          rol: admin.admin?.rol || "administrator",
          departament: admin.admin?.departament || "General"
        }
      });
    }

    if (action === "demote") {
      const admin = await User.findById(adminId);
      
      if (!admin || admin.rol !== "admin") {
        return NextResponse.json(
          { error: "Administratorul nu a fost găsit" },
          { status: 404 }
        );
      }

      // Verifică că nu se retrogrează pe sine
      if (admin._id.toString() === user._id.toString()) {
        return NextResponse.json(
          { error: "Nu te poți retrograda pe tine însuți" },
          { status: 400 }
        );
      }

      // Schimbă rolul în membru
      admin.rol = "membru";
      await admin.save();

      return NextResponse.json({
        message: "Administratorul a fost retrogradat la membru cu succes!"
      });
    }

    if (action === "promote") {
      const user = await User.findById(membruId);
      
      if (!user || (user.rol !== "membru" && user.rol !== "antrenor")) {
        return NextResponse.json(
          { error: "Utilizatorul nu a fost găsit sau nu poate fi promovat" },
          { status: 404 }
        );
      }

      const rolAnterior = user.rol;

      // Schimbă rolul în admin
      user.rol = "admin";
      await user.save();

      const mesaj = rolAnterior === "membru" 
        ? "Membrul a fost promovat la administrator cu succes!"
        : "Antrenorul a fost promovat la administrator cu succes!";

      return NextResponse.json({
        message: mesaj
      });
    }

    return NextResponse.json(
      { error: "Acțiune nevalidă" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Eroare la gestionarea administratorului:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}