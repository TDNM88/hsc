import type React from "react"
import Head from "next/head"
import dynamic from 'next/dynamic'
import Footer from "../Footer"

// Dynamically import NewHeader with no SSR
const NewHeader = dynamic(
  () => import('@/components/layout/NewHeader'),
  { ssr: false }
)

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

export default function Layout({ children, title = "London SSI" }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="London SSI Trading Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <NewHeader />
        <main className="flex-grow pt-20">{children}</main>
        <Footer />
      </div>
    </>
  )
}
