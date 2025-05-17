import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Interzis - Permisiuni insuficiente" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { userId, tipAbonament, dataInceput, dataSfarsit, status } = await req.json();

    if (!userId || !tipAbonament || !dataInceput || !dataSfarsit) {
      return NextResponse.json(
        { message: "Campuri obligatorii lipsa" },
        { status: 400 }
      );
    }

    if (!["Standard", "Standard+", "Premium"].includes(tipAbonament)) {
      return NextResponse.json(
        { message: "Tip abonament invalid" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ 
      _id: userId,
      rol: "membru"
    });

    if (!user) {
      return NextResponse.json(
        { message: "Utilizatorul nu a fost gasit sau nu este membru" },
        { status: 404 }
      );
    }

    const newSubscription = {
      tipAbonament,
      dataInceput: new Date(dataInceput),
      dataSfarsit: new Date(dataSfarsit),
      status: status || "valabil"
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          "membru.abonamente": newSubscription
        }
      },
      { new: true, runValidators: true }
    ).select("-parola");

    if (tipAbonament === "Premium") {
      await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            "membru.sedintePT": 5
          }
        }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Eroare la adaugarea abonamentului:", error);
    return NextResponse.json(
      { message: "Eroare de server interna" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Interzis - Permisiuni insuficiente" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { userId, subscriptionId, updates } = await req.json();

    if (!userId || !subscriptionId || !updates) {
      return NextResponse.json(
        { message: "Campuri obligatorii lipsa" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "Utilizatorul nu a fost gasit" },
        { status: 404 }
      );
    }

    const subscriptionIndex = user.membru.abonamente.findIndex(
      (sub: { _id: { toString(): string }; tipAbonament: string }) => sub._id.toString() === subscriptionId
    );

    if (subscriptionIndex === -1) {
      return NextResponse.json(
        { message: "Abonamentul nu a fost gasit" },
        { status: 404 }
      );
    }

    const oldSubscription = user.membru.abonamente[subscriptionIndex];
    const isUpgradeToPremiun = 
      oldSubscription.tipAbonament !== "Premium" && 
      updates.tipAbonament === "Premium";

    const updateFields: Record<string, unknown> = {};
    if (updates.tipAbonament) updateFields["membru.abonamente.$.tipAbonament"] = updates.tipAbonament;
    if (updates.dataInceput) updateFields["membru.abonamente.$.dataInceput"] = new Date(updates.dataInceput);
    if (updates.dataSfarsit) updateFields["membru.abonamente.$.dataSfarsit"] = new Date(updates.dataSfarsit);
    if (updates.status) updateFields["membru.abonamente.$.status"] = updates.status;

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, "membru.abonamente._id": subscriptionId },
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-parola");

    if (isUpgradeToPremiun) {
      await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            "membru.sedintePT": 5
          }
        }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Eroare la actualizarea abonamentului:", error);
    return NextResponse.json(
      { message: "Eroare de server interna" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Neautorizat" },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Interzis - Permisiuni insuficiente" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const subscriptionId = url.searchParams.get("subscriptionId");
    
    let finalUserId = userId;
    let finalSubscriptionId = subscriptionId;
    
    if (!finalUserId || !finalSubscriptionId) {
      try {
        const body = await req.json();
        finalUserId = finalUserId || body.userId;
        finalSubscriptionId = finalSubscriptionId || body.subscriptionId;
      } catch {
      }
    }

    if (!finalUserId || !finalSubscriptionId) {
      return NextResponse.json(
        { message: "ID-ul utilizatorului si ID-ul abonamentului sunt obligatorii" },
        { status: 400 }
      );
    }

    const user = await User.findById(finalUserId);
    if (!user) {
      return NextResponse.json(
        { message: "Utilizatorul nu a fost gasit" },
        { status: 404 }
      );
    }

    const subscription = user.membru.abonamente.find(
      (sub: { _id: { toString(): string } }) => sub._id.toString() === finalSubscriptionId
    );

    if (!subscription) {
      return NextResponse.json(
        { message: "Abonamentul nu a fost gasit" },
        { status: 404 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      finalUserId,
      {
        $pull: {
          "membru.abonamente": {
            _id: finalSubscriptionId
          }
        }
      },
      { new: true }
    ).select("-parola");

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Eroare la stergerea abonamentului:", error);
    return NextResponse.json(
      { message: "Eroare de server interna" },
      { status: 500 }
    );
  }
}