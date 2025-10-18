import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.primaryEmailAddress?.emailAddress;

    // check if user exists
    const userResult = await db
      .select()
      .from(usersTable)
    //   @ts-ignore
      .where(eq(usersTable.email, email));

      const data={
        name:user?.fullName??'NA',
        email:user?.primaryEmailAddress?.emailAddress??'',
        credits:2
      }
    // if not, insert new user
    if (!userResult || userResult.length === 0) {
      const result=await db.insert(usersTable).values({
        ...data
      });
    }
    return NextResponse.json({ user:data })
  } catch (error) {
    console.error("Error in /api/users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
