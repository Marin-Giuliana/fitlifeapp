import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models";
import { authOptions } from "@/lib/authOptions";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nu ești autentificat" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || session.user.id;

    // Verify user exists and user can access this QR code
    await connectToDatabase();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "Utilizatorul nu a fost găsit" },
        { status: 404 }
      );
    }

    // For security, only allow users to get their own QR code
    // unless they are admin or trainer
    if (
      session.user.id !== userId && 
      session.user.role !== "admin" && 
      session.user.role !== "antrenor"
    ) {
      return NextResponse.json(
        { error: "Nu ai permisiunea să accesezi acest QR code" },
        { status: 403 }
      );
    }

    // Generate QR code data - this could be a URL or JSON string
    const qrData = {
      userId: user._id.toString(),
      name: user.nume,
      email: user.email,
      role: user.rol,
      timestamp: new Date().toISOString(),
    };

    // For now, return the data. The QR code will be generated on the frontend
    return NextResponse.json({
      success: true,
      qrData: JSON.stringify(qrData),
      user: {
        id: user._id.toString(),
        name: user.nume,
        email: user.email,
        role: user.rol,
      }
    });

  } catch (error) {
    console.error("QR Code API error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare neașteptată" },
      { status: 500 }
    );
  }
}