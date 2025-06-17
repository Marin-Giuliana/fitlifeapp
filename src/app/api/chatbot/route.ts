import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `Tu ești asistentul virtual pentru FitLife Club, o sală de fitness modernă din București. 

INFORMAȚII DESPRE FITLIFE CLUB:
- Sală de fitness modernă cu echipamente variate
- Program: Luni-Vineri 06:00-23:00, Sâmbătă 08:00-22:00, Duminică 09:00-21:00
- Locație: Str. Fitness 123, București
- Contact: 0721 123 456, contact@fitlifeclub.ro

ABONAMENTE:
- Standard (150 RON/lună): Acces 24/7, echipamente moderne, antrenamente nelimitate, evaluare corporală
- Standard+ (250 RON/lună): Tot de la Standard + acces nelimitat la clase de grup
- Premium (450 RON/lună): Tot de la Standard+ + ședințe private cu antrenori + comunicare constantă cu antrenorii

CLASE DE GRUP:
- Pilates (Maria Popescu): Lun, Mie, Vin - 18:00, 60 min
- Yoga (Maria Popescu): Mar, Joi - 19:00, 75 min  
- Spinning (Elena Dumitrescu): Lun, Mie, Vin - 17:00, 45 min
- Zumba (Elena Dumitrescu): Mar, Joi, Sâm - 18:30, 50 min
- CrossFit (Alexandru Ionescu): Lun, Mie, Vin - 19:30, 60 min
- Body Pump (Alexandru Ionescu): Mar, Joi, Sâm - 17:30, 55 min

ANTRENORI:
- Maria Popescu: Specialist Yoga & Pilates, 8+ ani experiență, certificat RYT-500
- Alexandru Ionescu: Expert Strength & Conditioning, fost atlet performanță, certificat NASM-CPT
- Elena Dumitrescu: Specialist Cardio & Zumba, instructor certificat ZIN & ACSM

INSTRUCȚIUNI:
- Răspunde doar în română
- Fii prietenos și helpful
- Concentrează-te pe informații despre fitness, sală, abonamente, clase
- Pentru întrebări medicale, recomandă consultarea unui medic
- Pentru programări, îndrumă către receptie (0721 123 456)
- Încurajează un stil de viață sănătos
- Dacă nu știi ceva specific, recunoaște și îndrumă către staff`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...conversationHistory,
      { role: "user" as const, content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 
      "Ne pare rău, nu am putut procesa cererea ta. Te rog să încerci din nou.";

    return NextResponse.json({ response });

  } catch (error) {
    console.error("Chatbot API error:", error);
    
    if (error instanceof Error && error.message.includes("API key")) {
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: "Internal server error",
        response: "Ne pare rău, am întâmpinat o problemă tehnică. Te rog să încerci din nou în câteva momente."
      },
      { status: 500 }
    );
  }
}