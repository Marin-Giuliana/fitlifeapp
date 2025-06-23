import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { SesiunePrivata, User } from "@/models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
        { message: "Interzis - Doar membrii și adminii pot trimite feedback" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { sessionId, feedbackMessage } = await req.json();

    if (!sessionId || !feedbackMessage) {
      return NextResponse.json(
        { message: "SessionId și feedbackMessage sunt obligatorii" },
        { status: 400 }
      );
    }

    // Verify the session exists and allow feedback for confirmed and completed sessions
    const targetSession = await SesiunePrivata.findById(sessionId);

    if (!targetSession) {
      return NextResponse.json(
        { message: "Ședința nu a fost găsită" },
        { status: 404 }
      );
    }

    // Check if session status allows feedback
    if (!["confirmata", "finalizata"].includes(targetSession.status)) {
      return NextResponse.json(
        { message: "Feedback poate fi dat doar pentru ședințele confirmate sau finalizate" },
        { status: 400 }
      );
    }

    // Check if user has permission (member owns session or admin)
    if (session.user.role !== "admin" && targetSession.membru.id.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Nu aveți permisiunea să dați feedback pentru această ședință" },
        { status: 403 }
      );
    }

    // Get trainer details
    const trainer = await User.findById(targetSession.antrenor.id);
    if (!trainer) {
      return NextResponse.json(
        { message: "Antrenorul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Get member details
    const member = await User.findById(session.user.id);
    if (!member) {
      return NextResponse.json(
        { message: "Membrul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Send feedback email to trainer
    try {
      await resend.emails.send({
        from: 'FitLife <noreply@fitlifeclub.ro>', 
        to: [trainer.email],
        subject: 'Feedback nou pentru ședința ta de antrenament',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Feedback nou pentru ședința ta</h2>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Detalii ședință:</h3>
              <p><strong>Data:</strong> ${new Date(targetSession.dataSesiune).toLocaleDateString('ro-RO')}</p>
              <p><strong>Ora:</strong> ${targetSession.oraSesiune}</p>
              <p><strong>Membru:</strong> ${member.nume}</p>
            </div>
            
            <div style="background-color: #fefefe; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Feedback:</h3>
              <p style="line-height: 1.6;">${feedbackMessage}</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                Acest feedback este trimis pentru a te ajuta să îți îmbunătățești serviciile.
              </p>
              <p style="color: #6b7280; font-size: 14px;">
                Echipa FitLife
              </p>
            </div>
          </div>
        `
      });

      return NextResponse.json({
        message: "Feedback-ul a fost trimis cu succes antrenorului"
      });

    } catch (emailError) {
      console.error("Eroare la trimiterea email-ului:", emailError);
      return NextResponse.json(
        { message: "Eroare la trimiterea feedback-ului prin email" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Eroare la trimiterea feedback-ului:", error);
    return NextResponse.json(
      { message: "Eroare de server internă" },
      { status: 500 }
    );
  }
}