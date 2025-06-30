import type { NextApiRequest, NextApiResponse } from "next"

// In a real application, you would store these in a database
let settings = {
  bankName: "ABBANK",
  accountNumber: "0387473721",
  accountHolder: "VU VAN MIEN",
  minDeposit: 100000,
  minWithdrawal: 100000,
  minTrade: 100000,
  cskh: "https://t.me/DICHVUCSKHLS",
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json({ settings })
  }

  if (req.method === "PUT") {
    try {
      const { bankName, accountNumber, accountHolder, minDeposit, minWithdrawal, minTrade, cskh } = req.body

      settings = {
        bankName: bankName || settings.bankName,
        accountNumber: accountNumber || settings.accountNumber,
        accountHolder: accountHolder || settings.accountHolder,
        minDeposit: minDeposit || settings.minDeposit,
        minWithdrawal: minWithdrawal || settings.minWithdrawal,
        minTrade: minTrade || settings.minTrade,
        cskh: cskh || settings.cskh,
      }

      return res.status(200).json({ message: "Settings updated successfully", settings })
    } catch (error) {
      console.error("Settings update error:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  return res.status(405).json({ error: "Method not allowed" })
}
