import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { SesiunePrivata } from "@/models";
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

    const searchParams = req.nextUrl.searchParams;
    const antrenorId = searchParams.get("antrenorId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!antrenorId || !startDate || !endDate) {
      return NextResponse.json(
        { message: "antrenorId, startDate și endDate sunt obligatorii" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get existing sessions for the trainer in the specified date range
    const existingSessions = await SesiunePrivata.find({
      "antrenor.id": antrenorId,
      dataSesiune: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      status: { $ne: "anulata" }
    });

    // Mock availability data - in a real app, you'd have a trainer availability schema
    // This generates availability for the trainer excluding already booked slots
    const availability = generateTrainerAvailability(
      new Date(startDate),
      new Date(endDate),
      existingSessions
    );

    return NextResponse.json(availability);
  } catch (error) {
    console.error("Eroare la obținerea programului antrenorului:", error);
    return NextResponse.json(
      { message: "Eroare de server interna" },
      { status: 500 }
    );
  }
}

function generateTrainerAvailability(
  startDate: Date,
  endDate: Date,
  existingSessions: any[]
) {
  const availability = [];
  const currentDate = new Date(startDate);

  // Define default working hours (limited to 5 slots)
  const defaultTimeSlots = [
    "09:00", "11:00", "14:00", "16:00", "18:00"
  ];

  while (currentDate <= endDate) {
    // Skip Sundays (0 = Sunday)
    if (currentDate.getDay() !== 0) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Filter out times that are already booked
      const bookedTimes = existingSessions
        .filter(session => {
          const sessionDate = new Date(session.dataSesiune);
          return sessionDate.toISOString().split('T')[0] === dateStr;
        })
        .map(session => session.oraSesiune);

      const availableTimes = defaultTimeSlots.filter(time => 
        !bookedTimes.includes(time)
      );

      if (availableTimes.length > 0) {
        availability.push({
          date: new Date(currentDate),
          times: availableTimes
        });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return availability;
}