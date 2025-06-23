import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { PlanRequest, User } from "@/models";
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

    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = {};

    // Filter based on user role
    if (session.user.role === "antrenor") {
      filter["antrenor.id"] = session.user.id;
    } else if (session.user.role === "membru") {
      filter["membru.id"] = session.user.id;
    } else if (session.user.role === "admin") {
      // Admin can see all requests
    } else {
      return NextResponse.json(
        { message: "Acces interzis" },
        { status: 403 }
      );
    }

    // Add status filter if provided
    if (status && ["pending", "in_progress", "completed"].includes(status)) {
      filter.status = status;
    }

    const planRequests = await PlanRequest.find(filter)
      .sort({ dataCrearii: -1 })
      .limit(50);

    return NextResponse.json(planRequests);
  } catch (error) {
    console.error("Eroare la obținerea cererilor de planuri:", error);
    return NextResponse.json(
      { message: "Eroare de server internă" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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
        { message: "Doar membrii pot solicita planuri" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { antrenorId, tipPlan, mesaj } = await req.json();

    if (!antrenorId || !tipPlan || !mesaj) {
      return NextResponse.json(
        { message: "Toate câmpurile sunt obligatorii" },
        { status: 400 }
      );
    }

    if (!["alimentar", "exercitii", "ambele"].includes(tipPlan)) {
      return NextResponse.json(
        { message: "Tip plan invalid" },
        { status: 400 }
      );
    }

    // Get trainer info
    const trainer = await User.findOne({ 
      _id: antrenorId,
      rol: "antrenor"
    });

    if (!trainer) {
      return NextResponse.json(
        { message: "Antrenorul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Get member info
    const member = await User.findById(session.user.id);
    if (!member) {
      return NextResponse.json(
        { message: "Membrul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Create plan request
    const planRequest = await PlanRequest.create({
      membru: {
        id: session.user.id,
        nume: member.nume,
        email: member.email,
      },
      antrenor: {
        id: antrenorId,
        nume: trainer.nume,
      },
      tipPlan,
      mesaj,
      status: "pending"
    });

    return NextResponse.json({
      message: "Cererea de plan a fost trimisă cu succes",
      planRequest
    }, { status: 201 });

  } catch (error) {
    console.error("Eroare la crearea cererii de plan:", error);
    return NextResponse.json(
      { message: "Eroare de server internă" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    if (session.user.role !== "antrenor" && session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Doar antrenorii pot răspunde la cereri" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { id, status, raspuns } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "ID-ul cererii este obligatoriu" },
        { status: 400 }
      );
    }

    // Find the plan request
    const planRequest = await PlanRequest.findById(id);
    if (!planRequest) {
      return NextResponse.json(
        { message: "Cererea de plan nu a fost găsită" },
        { status: 404 }
      );
    }

    // Check if trainer owns this request (unless admin)
    if (session.user.role !== "admin" && planRequest.antrenor.id.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Nu aveți permisiunea să modificați această cerere" },
        { status: 403 }
      );
    }

    // Update plan request
    const updates: any = {};
    if (status && ["pending", "in_progress", "completed"].includes(status)) {
      updates.status = status;
    }
    if (raspuns !== undefined) {
      updates.raspuns = raspuns;
      updates.dataRaspunsului = new Date();
    }

    const updatedPlanRequest = await PlanRequest.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedPlanRequest);
  } catch (error) {
    console.error("Eroare la actualizarea cererii de plan:", error);
    return NextResponse.json(
      { message: "Eroare de server internă" },
      { status: 500 }
    );
  }
}