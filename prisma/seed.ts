import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  // Create admin user if it doesn't exist
  const adminEmail = "admin@example.com"
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  })

  if (!existingAdmin) {
    const hashedPassword = await hash("adminpassword", 10)

    await prisma.user.create({
      data: {
        name: "Admin User",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    })

    console.log("Admin user created")
  }

  // Create regular user if it doesn't exist
  const userEmail = "user@example.com"
  const existingUser = await prisma.user.findUnique({
    where: {
      email: userEmail,
    },
  })

  if (!existingUser) {
    const hashedPassword = await hash("userpassword", 10)

    await prisma.user.create({
      data: {
        name: "Regular User",
        email: userEmail,
        password: hashedPassword,
        role: "CITIZEN",
      },
    })

    console.log("Regular user created")
  }

  // Create some sample reports
  const user =
    existingUser ||
    (await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    }))

  if (user) {
    const reportsCount = await prisma.report.count()

    if (reportsCount === 0) {
      await prisma.report.createMany({
        data: [
          {
            picture: "/placeholder.svg?height=300&width=400",
            description: "Bache profundo en la avenida principal, peligroso para motocicletas",
            severity: "HIGH",
            status: "PENDING",
            latitude: -27.3364,
            longitude: -55.8675,
            address: "Av. Independencia 1234",
            authorId: user.id,
          },
          {
            picture: "/placeholder.svg?height=300&width=400",
            description: "Bache de tamaño mediano cerca del semáforo, afecta el tráfico",
            severity: "MEDIUM",
            status: "IN_PROGRESS",
            latitude: -27.33,
            longitude: -55.87,
            address: "Calle San Martín 567",
            authorId: user.id,
          },
          {
            picture: "/placeholder.svg?height=300&width=400",
            description: "Pequeño bache en la esquina, no muy profundo pero en crecimiento",
            severity: "LOW",
            status: "RESOLVED",
            latitude: -27.34,
            longitude: -55.86,
            address: "Ruta 1 km 23",
            authorId: user.id,
          },
        ],
      })

      console.log("Sample reports created")
    }
  }
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

