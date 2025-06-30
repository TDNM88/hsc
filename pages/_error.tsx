import { NextPage, NextPageContext } from 'next'
import Link from 'next/link'

interface ErrorProps {
  statusCode?: number
}

const Error: NextPage<ErrorProps> = ({ statusCode = 500 }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-6xl font-bold text-red-500">{statusCode || 'Error'}</h1>
        <h2 className="mt-4 text-2xl font-medium text-gray-200">
          {statusCode === 404
            ? 'Page not found'
            : 'An error occurred on the server'}
        </h2>
        <p className="mt-4 text-gray-400">
          {statusCode === 404
            ? "The page you're looking for doesn't exist or has been moved."
            : 'Please try again later or contact support if the problem persists.'}
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  )
}

Error.getInitialProps = async ({ res, err }: NextPageContext): Promise<ErrorProps> => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error