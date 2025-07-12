import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";


export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
      console.error('Lipsește signature-ul Stripe');
      return NextResponse.json({ error: 'Signature lipsa' }, { status: 400 });
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

      const paymentLinkId = session.payment_link;
      const amountTotal = session.amount_total; 
      
      console.log('Payment link ID:', paymentLinkId);
      console.log('Amount total (cenți):', amountTotal);
      console.log('Amount total (RON):', amountTotal / 100);

      let productType: 'abonament' | 'sedinte_pt' | null = null;
      let productDetails: { tipAbonament: string; durateLuni: number } | { sedintePT: number } | null = null;

      switch (amountTotal) {
        case 15000: // 150 RON
          productType = 'abonament';
          productDetails = { tipAbonament: 'Standard', durateLuni: 1 };
          break;
        case 25000: // 250 RON
          productType = 'abonament';
          productDetails = { tipAbonament: 'Standard+', durateLuni: 1 };
          break;
        case 40000: // 400 RON
          productType = 'abonament';
          productDetails = { tipAbonament: 'Premium', durateLuni: 1 };
          break;
        case 10000: // 100 RON
          productType = 'sedinte_pt';
          productDetails = { sedintePT: 1 };
          break;
        case 38000: // 380 RON
          productType = 'sedinte_pt';
          productDetails = { sedintePT: 4 };
          break;
        case 72000: // 720 RON
          productType = 'sedinte_pt';
          productDetails = { sedintePT: 8 };
          break;
        default:
          console.warn(`Sumă necunoscută: ${amountTotal} cenți (${amountTotal / 100} RON)`);
      }

      if (productType && productDetails) {
        console.log(`Produs identificat: ${productType}`, productDetails);

        if (productType === 'abonament' && productDetails && 'tipAbonament' in productDetails && 'durateLuni' in productDetails) {
          console.log('Adăugând abonament...');
          await addAbonament(user._id, productDetails);
        } else if (productType === 'sedinte_pt' && productDetails && 'sedintePT' in productDetails) {
          console.log('Adăugând ședințe PT...');
          await addSedinteTP(user._id, productDetails.sedintePT);
        }
      } else {
        console.error('Nu s-a putut identifica produsul bazat pe sumă');
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
  
  console.log(`Începând adăugarea abonament: ${tipAbonament} pentru user ${userId}`);
  
  const dataInceput = new Date();
  const dataSfarsit = new Date();
  dataSfarsit.setMonth(dataSfarsit.getMonth() + durateLuni);

  const nouAbonament = {
    tipAbonament,
    dataInceput,
    dataSfarsit,
    status: 'valabil'
  };

  console.log('Nou abonament creat:', nouAbonament);

  // Marchează abonamentele anterioare ca expirate
  const expireResult = await User.updateOne(
    { _id: userId },
    { 
      $set: { 
        "membru.abonamente.$[].status": "expirat" 
      }
    }
  );
  console.log('Rezultat expirare abonamente anterioare:', expireResult);

  const addResult = await User.updateOne(
    { _id: userId },
    { 
      $push: { 
        "membru.abonamente": nouAbonament 
      }
    }
  );
  console.log('Rezultat adăugare abonament nou:', addResult);

  // Dacă este abonament Premium, adaugă 15 ședințe PT
  if (tipAbonament === 'Premium') {
    console.log('Adăugând 15 ședințe PT pentru abonament Premium...');
    await addSedinteTP(userId, 15);
    console.log('15 ședințe PT adăugate cu succes pentru abonament Premium!');
  }

  console.log(`Abonament ${tipAbonament} adăugat pentru utilizatorul ${userId}`);
}

async function addSedinteTP(userId: string, numarSedinte: number) {
  console.log(`Începând adăugarea ${numarSedinte} ședințe PT pentru user ${userId}`);
  
  const result = await User.updateOne(
    { _id: userId },
    { 
      $inc: { 
        "membru.sedintePT": numarSedinte 
      }
    }
  );
  
  console.log('Rezultat adăugare ședințe PT:', result);
  console.log(`${numarSedinte} ședințe PT adăugate pentru utilizatorul ${userId}`);
}