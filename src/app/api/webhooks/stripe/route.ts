import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

interface StripeProductMapping {
  [key: string]: {
    type: 'abonament' | 'sedinte_pt';
    details: {
      tipAbonament?: string;
      durateLuni?: number;
      sedintePT?: number;
    };
  };
}

const STRIPE_PRODUCTS: StripeProductMapping = {
  'prod_standard': {
    type: 'abonament',
    details: {
      tipAbonament: 'Standard',
      durateLuni: 1
    }
  },
  'prod_standard_plus': {
    type: 'abonament',
    details: {
      tipAbonament: 'Standard+',
      durateLuni: 1
    }
  },
  'prod_premium': {
    type: 'abonament',
    details: {
      tipAbonament: 'Premium',
      durateLuni: 1
    }
  },
  'prod_pt_4_sedinte': {
    type: 'sedinte_pt',
    details: {
      sedintePT: 4
    }
  },
  'prod_pt_8_sedinte': {
    type: 'sedinte_pt',
    details: {
      sedintePT: 8
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
      console.error('Lipsește signature-ul Stripe');
      return NextResponse.json({ error: 'Signature lipsă' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET nu este configurat - webhook-ul va funcționa fără validare');
    }

    let event;
    try {
      if (!webhookSecret) {
        event = JSON.parse(body);
      } else {
        // În producție, validăm signature-ul
        // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        // event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
        
        // Pentru moment, parsăm direct până configurăm Stripe SDK
        event = JSON.parse(body);
      }
    } catch (err) {
      console.error('Eroare la parsarea webhook-ului Stripe:', err);
      return NextResponse.json({ error: 'Webhook invalid' }, { status: 400 });
    }

    console.log('Stripe webhook received:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      await connectToDatabase();

      const customerEmail = session.customer_details?.email;
      if (!customerEmail) {
        console.error('Nu s-a găsit email-ul clientului în sesiunea Stripe');
        return NextResponse.json({ error: 'Email client lipsă' }, { status: 400 });
      }

      const user = await User.findOne({ email: customerEmail });
      if (!user) {
        console.error(`Utilizatorul cu email-ul ${customerEmail} nu a fost găsit`);
        return NextResponse.json({ error: 'Utilizator negăsit' }, { status: 404 });
      }

      if (session.line_items?.data) {
        for (const item of session.line_items.data) {
          const productId = item.price?.product;
          
          if (!productId || !STRIPE_PRODUCTS[productId]) {
            console.warn(`Produs necunoscut sau lipsă: ${productId}`);
            continue;
          }

          const productMapping = STRIPE_PRODUCTS[productId];

          if (productMapping.type === 'abonament') {
            if (
              productMapping.details.tipAbonament !== undefined &&
              productMapping.details.durateLuni !== undefined
            ) {
              await addAbonament(user._id, {
                tipAbonament: productMapping.details.tipAbonament,
                durateLuni: productMapping.details.durateLuni
              });
            } else {
              console.error('Detalii abonament lipsă sau incomplete pentru produs:', productId);
            }
          } else if (productMapping.type === 'sedinte_pt') {
            await addSedinteTP(user._id, productMapping.details.sedintePT!);
          }
        }
      }

      console.log(`Plată procesată cu succes pentru ${customerEmail}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Eroare la procesarea webhook-ului Stripe:', error);
    return NextResponse.json(
      { error: 'Eroare la procesarea webhook-ului' },
      { status: 500 }
    );
  }
}

interface AbonamentDetails {
  tipAbonament: string;
  durateLuni: number;
}

async function addAbonament(userId: string, details: AbonamentDetails) {
  const { tipAbonament, durateLuni } = details;
  
  const dataInceput = new Date();
  const dataSfarsit = new Date();
  dataSfarsit.setMonth(dataSfarsit.getMonth() + durateLuni);

  const nouAbonament = {
    tipAbonament,
    dataInceput,
    dataSfarsit,
    status: 'valabil'
  };

  await User.updateOne(
    { _id: userId },
    { 
      $set: { 
        "membru.abonamente.$[].status": "expirat" 
      }
    }
  );

  await User.updateOne(
    { _id: userId },
    { 
      $push: { 
        "membru.abonamente": nouAbonament 
      }
    }
  );

  console.log(`Abonament ${tipAbonament} adăugat pentru utilizatorul ${userId}`);
}

async function addSedinteTP(userId: string, numarSedinte: number) {
  await User.updateOne(
    { _id: userId },
    { 
      $inc: { 
        "membru.sedintePT": numarSedinte 
      }
    }
  );

  console.log(`${numarSedinte} ședințe PT adăugate pentru utilizatorul ${userId}`);
}