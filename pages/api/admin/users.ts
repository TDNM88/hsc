import type { NextApiRequest, NextApiResponse } from "next"
import { withRateLimit, requireRole } from "@/lib/api-utils"
import { db } from "@/lib/db"
import { users } from "@/lib/schema"
import { eq, like, or, count, desc, and } from "drizzle-orm"
import jwt from "jsonwebtoken"

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    // Verify admin authentication
    const token = req.headers.authorization?.replace("Bearer ", "")
    if (!token) {
      return res.status(401).json({ error: "No token provided" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1)

    if (!user[0] || user[0].role !== "admin") {
      return res.status(403).json({ error: "Admin access required" })
    }

    if (req.method === "GET") {
      try {
        const { page = "1", limit = "20", search = "", status = "all" } = req.query
        const pageNumber = Number.parseInt(page as string, 10) || 1
        const limitNumber = Number.parseInt(limit as string, 10) || 20
        const offset = (pageNumber - 1) * limitNumber

        // Build where conditions
        let whereCondition

        if (search) {
          whereCondition = or(
            like(users.username, `%${search}%`),
            like(users.email, `%${search}%`),
            like(users.name, `%${search}%`),
          )
        }

        if (status !== "all") {
          const statusCondition = eq(users.isActive, status === "active")
          whereCondition = whereCondition ? and(whereCondition, statusCondition) : statusCondition
        }

        // Get users with pagination
        const [usersList, totalCount] = await Promise.all([
          db
            .select({
              id: users.id,
              username: users.username,
              email: users.email,
              name: users.name,
              phone: users.phone,
              balance: users.balance,
              role: users.role,
              isActive: users.isActive,
              createdAt: users.createdAt,
              updatedAt: users.updatedAt,
            })
            .from(users)
            .where(whereCondition)
            .orderBy(desc(users.createdAt))
            .limit(limitNumber)
            .offset(offset),

          db.select({ count: count() }).from(users).where(whereCondition),
        ])

        const formattedUsers = usersList.map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          phone: user.phone,
          balance: Number.parseFloat(user.balance),
          frozenBalance: 0,
          ipLogin: "127.0.0.1",
          status: user.isActive ? "Hoạt động" : "Offline",
          verified: true,
          betLocked: false,
          withdrawLocked: false,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        }))

        return res.status(200).json({
          users: formattedUsers,
          pagination: {
            page: pageNumber,
            limit: limitNumber,
            total: totalCount[0]?.count || 0,
            totalPages: Math.ceil((totalCount[0]?.count || 0) / limitNumber),
          },
        })
      } catch (error) {
        console.error("Error fetching users:", error)
        return res.status(500).json({ error: "Internal server error" })
      }
    } else if (req.method === "PUT") {
      try {
        const { userId, action, value } = req.body

        const updateData: any = {}

        switch (action) {
          case "toggleStatus":
            updateData.isActive = value
            break
          case "toggleVerification":
            // Add verification field if needed
            break
          case "toggleBetLock":
            // Add betLocked field if needed
            break
          case "toggleWithdrawLock":
            // Add withdrawLocked field if needed
            break
          default:
            if (typeof value === "boolean") {
              updateData.isActive = value
            }
        }

        if (Object.keys(updateData).length > 0) {
          await db.update(users).set(updateData).where(eq(users.id, userId))
        }

        return res.status(200).json({ message: "User updated successfully" })
      } catch (error) {
        console.error("Error updating user:", error)
        return res.status(500).json({ error: "Internal server error" })
      }
    } else if (req.method === "DELETE") {
      try {
        const { userId } = req.body

        await db.delete(users).where(eq(users.id, userId))

        return res.status(200).json({ message: "User deleted successfully" })
      } catch (error) {
        console.error("Error deleting user:", error)
        return res.status(500).json({ error: "Internal server error" })
      }
    }

    return res.status(405).json({ error: "Method not allowed" })
  } catch (error) {
    console.error("Admin users error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export default async function rateLimitedHandler(req: NextApiRequest, res: NextApiResponse) {
  return withRateLimit(
    req,
    res,
    async () => {
      const authedHandler = requireRole("admin")(handler)
      return authedHandler(req, res)
    },
    "admin-users",
    "Too many requests to admin users API.",
  )
}
