import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models";

// Define interface outside the function for better maintainability
interface UserData {
  nume: string;
  email: string;
  parola: string;
  dataNasterii?: Date;
  sex?: string;
  rol: string;
  antrenor?: {
    dataAngajarii: Date;
    specializari: string[];
  };
  membru?: {
    dataInregistrare: Date;
    sedintePT: number;
    abonamente: {
      tipAbonament: "Standard" | "Standard+" | "Premium";
      dataInceput: Date;
      dataSfarsit: Date;
      status: "valabil" | "expirat";
    }[];
  };
}

export async function POST(req: NextRequest) {
  try {
    const { nume, email, parola, dataNasterii, sex, rol } = await req.json();

    // validate input
    if (!nume || !email || !parola) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // validate password length
    if (parola.length < 8) {
      return NextResponse.json(
        { message: "Parola trebuie să aibă cel puțin 8 caractere" },
        { status: 400 }
      );
    }

    // connect to database
    await connectToDatabase();

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Prepare user data with proper type
    const userData: UserData = {
      nume,
      email,
      parola,
      dataNasterii: dataNasterii ? new Date(dataNasterii) : undefined,
      sex,
      rol: rol || "membru"
    };

    if (rol === "antrenor") {
      userData.antrenor = {
        dataAngajarii: new Date(),
        specializari: []
      };
    } else if (rol === "membru" || !rol) {
      userData.membru = {
        dataInregistrare: new Date(),
        sedintePT: 0,
        abonamente: []
      };
    }

    // create user
    const user = await User.create(userData);

    // return user data without sensitive information
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id,
          nume: user.nume,
          email: user.email,
          rol: user.rol,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}