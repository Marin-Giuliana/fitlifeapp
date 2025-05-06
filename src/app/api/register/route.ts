import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, User } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    // validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
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

    // create user
    // in a real app, you would hash the password before storing it
    const user = await User.create({
      name,
      email,
      password, // in a real application, you would store the hashed password
      role: role || "member", // default to member if no role provided
    });

    // return user data without sensitive information
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
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