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

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase().trim() },
    update: { passwordHash },
    create: {
      email: email.toLowerCase().trim(),
      passwordHash,
      name: "Santi Irawati",
    },
  });

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
