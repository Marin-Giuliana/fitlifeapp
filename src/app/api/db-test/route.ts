import { NextResponse } from 'next/server';
import { connectToDatabase, User } from '@/lib/mongodb';

export async function GET() {
  try {
    // connect to the database
    await connectToDatabase();
    
    // check if we can create a test document
    const testUser = await User.create({
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      role: 'member'
    });
    
    // find the user we just created to confirm it exists
    const foundUser = await User.findById(testUser._id);
    
    // delete the test user
    await User.findByIdAndDelete(testUser._id);
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful!',
      databaseStatus: 'connected',
      testUser: {
        created: !!testUser,
        found: !!foundUser,
        deleted: true
      }
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'MongoDB connection failed!',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}