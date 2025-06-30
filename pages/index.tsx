"use client"

import { useRouter } from "next/router"
import Layout from "../components/layout/Layout"
import { Button } from "@/components/ui/button"
import { AnimatedButton } from "@/components/ui/animated-button"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Dynamically import TradingViewMarketOverview with no SSR
const TradingViewMarketOverview = dynamic(
  () => import("@/components/TradingViewMarketOverview"),
  { ssr: false }
)

// Ticker Tape
const TradingViewTickerTape = dynamic(
  () => import("@/components/TradingViewTickerTape"),
  { ssr: false }
)

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Landing() {
  const router = useRouter()

  const handleLogin = () => {
    router.push("/account")
  }

  const handleRegister = () => {
    router.push("/register")
  }

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [])

  return (
    <Layout title="London SSI - Giao dịch ngoại hối và đầu tư tài chính">
      {/* Market Data Ticker */}
      <div className="w-full h-[46px] overflow-hidden">
        <TradingViewTickerTape />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Image and News */}
          <div className="md:col-span-1">
            <div className="relative w-full h-auto">
              <img
                src="/slide1.jpg"
                alt="London Stock Exchange"
                className="w-full h-auto mb-4"
              />
              <img
                src="/slide4.jpg"
                alt="London Stock Exchange"
                className="w-full h-auto mb-4 absolute top-0 left-0 opacity-0 transition-opacity duration-1000"
              />
            </div>
            <h2 className="text-lg font-bold mt-2">
              Sàn giao dịch chứng khoán London SSI chào đón Thông đốc Samuel
              Garcia tại Nuevo León, Mexico
            </h2>
            <p className="text-sm mt-2">
              Sàn giao dịch chứng khoán London SSI rát hân hạnh được chào đón
              Samuel Garcia tại vùng đất lớn của mình, nơi ông đã mang lại nhiều
              cơ hội giao dịch mới trong một thời gian ngắn. Ông đã làm việc với
              các công ty con để đảm bảo các cơ hội trong khu vực của mình và
              các khu vực khác.
            </p>
          </div>

          {/* Center Column - London SSI Info */}
          <div className="md:col-span-1">
            <div>
              <h2 className="text-lg font-bold">LONDON SSI</h2>
              <p className="text-sm mt-2">
                Sàn giao dịch chứng khoán London (SSI) là sàn giao dịch chứng
                khoán chính ở Vương quốc Anh và lớn nhất ở châu Âu. Thành lập
                chính thức từ năm 1773, các sàn giao dịch khu vực được sáp nhập
                vào năm 1973 để hình thành nên Sàn giao dịch chứng khoán Vương
                quốc Anh và Ireland, sau đó đổi tên thành Sàn giao dịch chứng
                khoán London (SSI)
              </p>
            </div>
            
            <div className="mt-12">
              <h2 className="text-lg font-bold">
                Nội dung về sàn giao dịch chứng khoán London SSI
              </h2>
              <p className="text-sm mt-2">
                Sàn giao dịch chứng khoán London (SSI) là sàn giao dịch chứng
                khoán quốc tế nhất với hàng ngàn công ty từ hơn 60 quốc gia
                  và là nguồn hàng đầu của tính thanh khoản thị trường vốn, giá
                  chuẩn và dữ liệu thị trường ở châu Âu. Có các quan hệ đối tác
                  với các sàn giao dịch quốc tế ở châu Á và châu Phi, SSI dự
                  định loại bỏ các rào cản về chi phí và các qui định khỏi thị
                  trường vốn trên toàn thế giới.
                </p>
            </div>
          </div>

          {/* Right Column - News and FTSE */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <iframe
                width="100%"
                height="315"
                src="https://www.youtube.com/embed/xnCF64dVscM?si=RZOPiZ6gCjNVv6xB"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <div className="w-full text-xs">
              <iframe
                style={{ width: '̀80vw', height: '320px' }}
                allowTransparency={true}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                  src="https://www.tradingview-widget.com/embed-widget/symbol-info/?locale=vi_VN&amp;symbol=SPREADEX%3AFTSE#%7B%22symbol%22%3A%22SPREADEX%3AFTSE%22%2C%22width%22%3A%22100%25%22%2C%22colorTheme%22%3A%22light%22%2C%22isTransparent%22%3Afalse%2C%22height%22%3A320%2C%22utm_source%22%3A%22london-ssi.com%22%2C%22utm_medium%22%3A%22widget%22%2C%22utm_campaign%22%3A%22symbol-info%22%2C%22page-uri%22%3A%22london-ssi.com%2F%22%7D"
                  title="symbol info TradingView widget"
                  lang="en"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>

      {/* Chart Section */}
      <div className="py-8 bg-white-900">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-bold text-black mb-2">Chi số xu hướng</h2>
          <p className="text-gray-300 text-sm mb-4 text-black">
            Đồ thị trong 4 giờ theo giờ ET trong ngày hôm nay
          </p>
          <div className="w-full h-[500px] rounded-lg overflow-hidden bg-white">
            <TradingViewMarketOverview />
          </div>
        </div>
      </div>

      {/* WisdomTree Banner Section */}
      <div className="bg-[#0b0033] py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <img
              src="/wisdomtree-banner.png"
              alt="WisdomTree Banner"
              className="rounded-lg shadow-lg w-full h-auto"
            />
          </div>
          <div className="text-white space-y-4">
            <h2 className="text-3xl font-bold">
              Sở giao dịch chứng khoán London SSI và nền tảng WisdomTree ở châu
              Âu
            </h2>
            <p className="text-sm">
              Quỹ hoán đổi danh mục (ETF) và nhà phát hành sản phẩm giao dịch
              trao đổi (ETP) toàn cầu, WisdomTree, đã kỷ niệm một thập kỷ kinh
              doanh ở châu Âu tại Sở giao dịch chứng khoán London hôm nay.</p>
            <p className="text-sm"> 
              WisdomTree gia nhập thị trường châu Âu vào năm 2014, dựa trên một chiến dịch thành công ở Mỹ, nơi hoạt động kinh doanh ETF của nó được thành lập vào năm 2006. Hiện là nhà cung cấp ETP thuần túy lớn nhất thế giới với hơn 110 tỷ đô la AUM toàn cầu, nỗ lực gia tăng giá trị cho danh mục đầu tư của WisdomTree khiến nó khác biệt so với các công ty cùng ngành. Doanh nghiệp tự hào có một đội ngũ nghiên cứu đẳng cấp thế giới và phạm vi ETP khác biệt phục vụ một số nhà đầu tư tổ chức lớn nhất trên toàn cầu. </p>
            <p className="text-sm"> Trong thập kỷ kể từ khi ra mắt, WisdomTree đã tăng AUM lên 30 tỷ đô la ở châu Âu trên một loạt sản phẩm từng đoạt giải thưởng bao gồm cổ phiếu cốt lõi và theo chủ đề, hàng hóa, tiền điện tử và một loạt các ETP ngắn và đòn bẩy, trong số những người khác.</p>
          </div>
        </div>
      </div>

      {/* Info + Image Section */}
      <div className="bg-[#eae2ff] py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0b0033] leading-tight">
              Sở Giao dịch Chứng khoán Thành phố Hồ Chí Minh - Công Ty Cổ Phần
              Chứng Khoán TP. HCM
            </h2>
            <div className="space-y-4 text-[#333] text-base md:text-lg leading-relaxed">
              <p>
                Theo Quyết định số 599/2007/QD-TTg của Thủ tướng Chính phủ năm
                2007, Trung tâm Giao dịch Chứng khoán TP.HCM được chuyển đổi
                thành Sở Giao dịch Chứng khoán TP.HCM, với vốn điều lệ ban đầu
                là 1.000 tỷ đồng…
              </p>
              <p>Thủ tướng Chính phủ đã ban hành Quyết định số 37/2020/QD-TTg ngày 23/12/2020 về việc thành lập Sở Giao dịch Chứng khoán Việt Nam.[1] Theo đó, Sở giao dịch chứng khoán Hà Nội và Sở giao dịch chứng khoán TP.HCM trở thành công ty con do Sở giao dịch chứng khoán Việt Nam sở hữu 100% vốn điều lệ.</p>
              <AnimatedButton
                variant="default"
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => router.push("/register")}
              >
                Liên hệ chúng tôi
              </AnimatedButton>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <img
              src="/ss.jpg"
              alt="Skyscraper"
              className="rounded-lg shadow-xl w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="bg-[#eae2ff] py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <img
            src="/gallery2.jpg"
            alt="London Stock Exchange"
            className="w-full h-48 object-cover rounded-lg shadow"
          />
          <img
            src="/gallery3.jpg"
            alt="Borsa Frankfurt"
            className="w-full h-48 object-cover rounded-lg shadow"
          />
          <img
            src="/gallery4.jpg"
            alt="Trading Floor"
            className="w-full h-48 object-cover rounded-lg shadow"
          />
        </div>
      </div>

      {/* Experts Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Thông tin các chuyên gia quốc tế có chứng chỉ CFA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Expert 1 */}
            <div className="flex items-start space-x-4">
              <img src="/experts/1.jpg" alt="Emmanuel Cau" className="w-16 h-16 rounded-full object-cover" />
              <div>
                <h3 className="font-semibold">Emmanuel Cau, CFA</h3>
                <p className="text-sm text-gray-600">Giám đốc Sở giao dịch chứng khoán châu Âu, Barclays</p>
              </div>
            </div>
            {/* Expert 2 */}
            <div className="flex items-start space-x-4">
              <img src="/experts/2.jpg" alt="Emmanuel CAU" className="w-16 h-16 rounded-full object-cover" />
              <div>
                <h3 className="font-semibold">Emmanuel CAU</h3>
                <p className="text-sm text-gray-600">Chargé de Communication Marketing</p>
              </div>
            </div>
            {/* Expert 3 */}
            <div className="flex items-start space-x-4">
              <img src="/experts/3.jpg" alt="Merav Ozair" className="w-16 h-16 rounded-full object-cover" />
              <div>
                <h3 className="font-semibold">MERAV OZAIR, TIẾN SĨ</h3>
                <p className="text-sm text-gray-600">Tương lai của tài chính: AI đáp ứng được token hóa</p>
              </div>
            </div>
            {/* Expert 4 */}
            <div className="flex items-start space-x-4">
              <img src="/experts/4.jpg" alt="Comunidade CFA" className="w-16 h-16 rounded-full object-cover" />
              <div>
                <h3 className="font-semibold">Comunidade CFA – Eu me Banco</h3>
                <p className="text-sm text-gray-600">Chuyên gia hoạt động như các nhà phân tích tài chính và đầu tư</p>
              </div>
            </div>
            {/* Expert 5 */}
            <div className="flex items-start space-x-4">
              <img src="/experts/5.jpg" alt="Richard" className="w-16 h-16 rounded-full object-cover" />
              <div>
                <h3 className="font-semibold">RICHARD SAINTVILUS</h3>
                <p className="text-sm text-gray-600">AI sáng tạo xông vào điện toán đám mây</p>
              </div>
            </div>
            {/* Expert 6 */}
            <div className="flex items-start space-x-4">
              <img src="/experts/6.jpg" alt="Richard Tesla" className="w-16 h-16 rounded-full object-cover" />
              <div>
                <h3 className="font-semibold">RICHARD TESLA</h3>
                <p className="text-sm text-gray-600">Tại sao ĐÃ đến lúc Mua Cổ phiếu Tesla</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
