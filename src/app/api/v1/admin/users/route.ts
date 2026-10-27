import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN_BAAK", "SUPERADMIN"] },
      },
      select: {
        id: true,
        email: true,
        nim: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("List admin users error:", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar akun admin" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, nim, password, role } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email admin tidak valid" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanNim = (nim || "").trim().toUpperCase() || `ADMIN_${Date.now().toString().slice(-4)}`;

    // Cek apakah email sudah terdaftar
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { nim: cleanNim }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email atau ID Staf sudah digunakan oleh akun lain" },
        { status: 400 }
      );
    }

    // Hash password jika diberikan
    let passwordHash: string | undefined;
    if (password && password.trim()) {
      passwordHash = crypto.createHash("sha256").update(password.trim()).digest("hex");
    }

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        nim: cleanNim,
        passwordHash,
        role: role === "SUPERADMIN" ? "SUPERADMIN" : "ADMIN_BAAK",
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        nim: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil membuat akun admin: ${newUser.email}`,
      user: newUser,
    });
  } catch (error) {
    console.error("Create admin user error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Gagal membuat akun admin baru" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID user wajib diisi" }, { status: 400 });
    }

    const totalAdmins = await prisma.user.count({
      where: { role: { in: ["ADMIN_BAAK", "SUPERADMIN"] } },
    });

    if (totalAdmins <= 1) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus satu-satunya akun admin yang tersisa." },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Akun admin berhasil dihapus.",
    });
  } catch (error) {
    console.error("Delete admin user error:", error);
    return NextResponse.json({ error: "Gagal menghapus akun admin" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, password, role, status } = body;

    if (!id) {
      return NextResponse.json({ error: "ID user wajib diisi" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (password && typeof password === "string" && password.trim().length >= 6) {
      updateData.passwordHash = crypto.createHash("sha256").update(password.trim()).digest("hex");
    } else if (password) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }

    if (role && ["ADMIN_BAAK", "SUPERADMIN"].includes(role)) {
      updateData.role = role;
    }

    if (status && ["ACTIVE", "INACTIVE"].includes(status)) {
      updateData.status = status;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        nim: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Akun ${updated.email} berhasil diperbarui.`,
      user: updated,
    });
  } catch (error) {
    console.error("Update admin user error:", error);
    return NextResponse.json({ error: "Gagal memperbarui akun admin" }, { status: 500 });
  }
}
