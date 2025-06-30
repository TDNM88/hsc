import Layout from "@/components/layout/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function AboutPage() {
  return (
    <Layout title="Về Chúng Tôi | London SSI">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Về Chúng Tôi</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Giới Thiệu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                London SSI là một trong những đơn vị hàng đầu trong lĩnh vực cung cấp dịch vụ giao dịch tài chính, 
                cam kết mang đến cho khách hàng những trải nghiệm giao dịch minh bạch, an toàn và hiệu quả.
              </p>
              <p>
                Với đội ngũ chuyên gia giàu kinh nghiệm và công nghệ hiện đại, chúng tôi tự hào là đối tác 
                tin cậy của hàng ngàn nhà đầu tư trên khắp Việt Nam.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Cơ Sở Pháp Lý</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Quá Trình Hình Thành Và Phát Triển
                  </h3>
                  <p className="text-gray-700">
                    Theo Quyết định số 599/2007/QD-TTg của Thủ tướng Chính phủ năm 2007, 
                    Trung tâm Giao dịch Chứng khoán TP.HCM được chuyển đổi thành Sở Giao dịch Chứng khoán TP.HCM, 
                    với vốn điều lệ ban đầu là 1.000 tỷ đồng và Bộ Tài chính là chủ sở hữu đại diện cho cơ quan. 
                    Vốn điều lệ được điều chỉnh lên 2.000 tỷ đồng vào năm 2018.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Cơ Cấu Tổ Chức Hiện Tại
                  </h3>
                  <p className="text-gray-700">
                    Thủ tướng Chính phủ đã ban hành Quyết định số 37/2020/QD-TTg ngày 23/12/2020 về việc 
                    thành lập Sở Giao dịch Chứng khoán Việt Nam. Theo đó, Sở giao dịch chứng khoán Hà Nội và 
                    Sở giao dịch chứng khoán TP.HCM trở thành công ty con do Sở giao dịch chứng khoán Việt Nam 
                    sở hữu 100% vốn điều lệ.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Tầm Nhìn Và Sứ Mệnh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Tầm Nhìn</h3>
                  <p className="text-gray-700">
                    Trở thành sàn giao dịch tài chính hàng đầu Việt Nam, cung cấp các giải pháp 
                    đầu tư hiện đại, minh bạch và hiệu quả cho mọi nhà đầu tư.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Sứ Mệnh</h3>
                  <p className="text-gray-700">
                    Mang đến cho khách hàng những trải nghiệm giao dịch tốt nhất với công nghệ hiện đại, 
                    chi phí cạnh tranh và dịch vụ chuyên nghiệp.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
