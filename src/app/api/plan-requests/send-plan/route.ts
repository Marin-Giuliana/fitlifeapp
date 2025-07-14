import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { PlanRequest } from "@/models";
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

    if (session.user.role !== "antrenor" && session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Doar antrenorii pot trimite planuri" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { planRequestId, planContent } = await req.json();

    if (!planRequestId || !planContent) {
      return NextResponse.json(
        { message: "ID-ul cererii și conținutul planului sunt obligatorii" },
        { status: 400 }
      );
    }

    // Find the plan request
    const planRequest = await PlanRequest.findById(planRequestId);
    if (!planRequest) {
      return NextResponse.json(
        { message: "Cererea de plan nu a fost găsită" },
        { status: 404 }
      );
    }

    // Check if trainer owns this request (unless admin)
    if (
      session.user.role !== "admin" &&
      (!planRequest.antrenor || planRequest.antrenor.id.toString() !== session.user.id)
    ) {
      return NextResponse.json(
        { message: "Nu aveți permisiunea să răspundeți la această cerere" },
        { status: 403 }
      );
    }

    // Determine plan type for email subject
    const planTypeTextMap = {
      alimentar: "Planul alimentar",
      exercitii: "Planul de exerciții", 
      ambele: "Planurile alimentar și de exerciții"
    };
    const planTypeText = planTypeTextMap[planRequest.tipPlan as keyof typeof planTypeTextMap] || "Planul";

    // Send email to member
    try {
      if (!planRequest.membru || !planRequest.membru.email) {
        return NextResponse.json(
          { message: "Membrul nu are o adresă de email asociată" },
          { status: 400 }
        );
      }

      await resend.emails.send({
        from: 'FitLife <noreply@fitlifeclub.ro>',
        to: [planRequest.membru.email],
        subject: `${planTypeText} de la antrenorul ${planRequest.antrenor?.nume ?? "necunoscut"}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">${planTypeText} personalizat</h2>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Detalii:</h3>
              <p><strong>Antrenor:</strong> ${planRequest.antrenor?.nume ?? "necunoscut"}</p>
              <p><strong>Tip plan:</strong> ${planRequest.tipPlan}</p>
              <p><strong>Data cererii:</strong> ${new Date(planRequest.dataCrearii).toLocaleDateString('ro-RO')}</p>
            </div>
            
            <div style="background-color: #fefefe; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Mesajul tău inițial:</h3>
              <p style="line-height: 1.6; font-style: italic;">"${planRequest.mesaj}"</p>
            </div>

            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">${planTypeText}:</h3>
              <div style="line-height: 1.6; white-space: pre-line;">${planContent}</div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                Acest plan a fost creat special pentru tine de antrenorul ${planRequest.antrenor?.nume ?? "necunoscut"}.
              </p>
              <p style="color: #6b7280; font-size: 14px;">
                Echipa FitLife
              </p>
            </div>
          </div>
        `
      });

      // Update plan request status
      await PlanRequest.findByIdAndUpdate(planRequestId, {
        $set: {
          status: "completed",
          raspuns: planContent,
          dataRaspunsului: new Date()
        }
      });

      return NextResponse.json({
        message: "Planul a fost trimis cu succes pe email"
      });

    } catch (emailError) {
      console.error("Eroare la trimiterea email-ului:", emailError);
      return NextResponse.json(
        { message: "Eroare la trimiterea planului prin email" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Eroare la trimiterea planului:", error);
    return NextResponse.json(
      { message: "Eroare de server internă" },
      { status: 500 }
    );
  }
}