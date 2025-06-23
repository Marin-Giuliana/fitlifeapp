import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({
        message: "No session found",
        session: null
      });
    }

    await connectToDatabase();
    
    // Get the user from database to see the actual data
    const dbUser = await User.findById(session.user.id);
    
    return NextResponse.json({
      message: "Session found",
      session: {
        user: session.user,
        sessionData: session
      },
      dbUser: dbUser ? {
        _id: dbUser._id,
        nume: dbUser.nume,
        email: dbUser.email,
        rol: dbUser.rol,
        googleId: dbUser.googleId
      } : null
    });
  } catch (error) {
    console.error("Session debug error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}