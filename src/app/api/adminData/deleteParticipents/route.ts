import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { getToken, GetUserType } from "@/utils/token";

export async function DELETE(req: Request) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid ids provided for deletion" },
        { status: 400 }
      );
    }

    const token = await getToken(req);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. No token provided." },
        { status: 401 }
      );
    }
    const userType = await GetUserType(token);
    if (!userType || userType != "Admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access you are not an admin" },
        { status: 401 }
      );
    }
    await connectToDatabase();
    const result = await User.deleteMany({ UserId: { $in: ids } });

    if (result.deletedCount > 0) {
      return NextResponse.json({
        success: true,
        message: `${result.deletedCount} user(s) deleted successfully.`,
      });
    } else {
      return NextResponse.json(
        { success: false, message: "No users found with the provided emails." },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error deleting users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete users." },
      { status: 500 }
    );
  }
}
