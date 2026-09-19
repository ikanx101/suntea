const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

function loadDefaultLogoDataUrl() {
  const logoPath = path.join(__dirname, "..", "public", "logo.png");
  if (!fs.existsSync(logoPath)) return null;
  const buffer = fs.readFileSync(logoPath);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL dan ADMIN_PASSWORD wajib diisi di environment variable sebelum menjalankan seed.",
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  let user = existingUser;
  if (!existingUser) {
    const passwordHash = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: "Santi Irawati",
      },
    });
    console.log(`Admin user dibuat: ${user.email}`);
  } else {
    console.log(`Admin user sudah ada, password tidak diubah (ganti lewat halaman Pengaturan): ${user.email}`);
  }

  await prisma.settings.upsert({
    where: { id: "settings" },
    update: {},
    create: {
      id: "settings",
      storeName: "Toko Santi Irawati",
      logoDataUrl: loadDefaultLogoDataUrl(),
    },
  });

  console.log(`Seed selesai. Admin user: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
