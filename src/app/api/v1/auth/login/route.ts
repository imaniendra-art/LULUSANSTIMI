import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { setSession, SessionUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password, isDemo } = body;

    // Quick demo login for BAAK Admin
    if (isDemo) {
      let admin = await prisma.user.findFirst({
        where: { role: "ADMIN_BAAK" },
      });

      if (!admin) {
        admin = await prisma.user.create({
          data: {
            email: "baak@stimi-yapmi.ac.id",
            nim: "ADMIN001",
            role: "ADMIN_BAAK",
            status: "ACTIVE",
          },
        });
      }

      const sessionUser: SessionUser = {
        id: admin.id,
        email: admin.email || "baak@stimi-yapmi.ac.id",
        nim: admin.nim || "ADMIN001",
        fullName: "Staf BAAK STIMI YAPMI Makassar",
        role: "ADMIN_BAAK",
      };

      await setSession(sessionUser);

      return NextResponse.json({
        success: true,
        message: "Login berhasil sebagai Administrator BAAK",
        user: sessionUser,
      });
    }

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/NIM dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    // Find by email or nim
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.trim().toLowerCase() },
          { nim: identifier.trim() },
        ],
      },
      include: {
        alumni: true,
      },
    });

    // Check credentials (for BAAK admin default password is "admin123")
    const isBaakDefault =
      (identifier.toLowerCase().includes("baak") || identifier === "ADMIN001") &&
      password === "admin123";

    if (!user && !isBaakDefault) {
      return NextResponse.json(
        { error: "Kredensial tidak valid atau akun belum terdaftar." },
        { status: 401 }
      );
    }

    const sessionUser: SessionUser = {
      id: user?.id || "demo-baak-id",
      email: user?.email || "baak@stimi-yapmi.ac.id",
      nim: user?.nim || "ADMIN001",
      fullName: user?.alumni?.[0]?.fullName || "Staf BAAK STIMI YAPMI Makassar",
      role: user?.role || "ADMIN_BAAK",
    };

    await setSession(sessionUser);

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: sessionUser,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat memproses autentikasi" },
      { status: 500 }
    );
  }
}
