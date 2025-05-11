import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User, Echipament, Clasa, SesiunePrivata } from '@/models';

export async function GET() {
  try {
    await connectToDatabase();

    // Test user
    const testUser = await User.create({
      nume: 'Test User',
      email: `test-${Date.now()}@example.com`,
      parola: 'password123',
      dataNasterii: new Date('1990-01-01'),
      sex: 'masculin',
      rol: 'membru',
      membru: {
        dataInregistrare: new Date(),
        sedintePT: 0,
        abonamente: []
      }
    });

    // Test equipment
    const testEchipament = await Echipament.create({
      denumire: 'Test Equipment',
      producator: 'Test Manufacturer',
      dataAchizitionare: new Date(),
      stare: 'functional'
    });

    // Test class
    const testClasa = await Clasa.create({
      tipClasa: 'Yoga',
      nrLocuri: 20,
      antrenor: {
        id: testUser._id,
        nume: testUser.nume
      },
      dataClasa: new Date(Date.now() + 86400000), // tomorrow
      oraClasa: '18:00',
      participanti: []
    });

    // Test private session
    const testSesiune = await SesiunePrivata.create({
      antrenor: {
        id: testUser._id,
        nume: testUser.nume
      },
      membru: {
        id: testUser._id, // just for testing
        nume: testUser.nume
      },
      dataSesiune: new Date(Date.now() + 172800000), // day after tomorrow
      oraSesiune: '14:00',
      status: 'confirmata'
    });

    // Clean up - delete test records
    await User.findByIdAndDelete(testUser._id);
    await Echipament.findByIdAndDelete(testEchipament._id);
    await Clasa.findByIdAndDelete(testClasa._id);
    await SesiunePrivata.findByIdAndDelete(testSesiune._id);

    return NextResponse.json({
      success: true,
      message: 'MongoDB connection and models test successful!',
      databaseStatus: 'connected',
      testResults: {
        user: { created: !!testUser, deleted: true },
        echipament: { created: !!testEchipament, deleted: true },
        clasa: { created: !!testClasa, deleted: true },
        sesiunePrivata: { created: !!testSesiune, deleted: true }
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