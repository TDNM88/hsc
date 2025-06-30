import { Button } from "@/components/ui/button"
import Link from "next/link"
import Head from "next/head"

export default function Custom404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Head>
        <title>404 - Trang không tìm thấy | London HSC</title>
        <meta name="description" content="Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển." />
      </Head>
      
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Trang không tìm thấy</h2>
        <p className="text-gray-600 mb-8">Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.</p>
        
        <div className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/">
              Về trang chủ
            </Link>
          </Button>
          <Button asChild>
            <Link href="/trade">
              Giao dịch ngay
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
