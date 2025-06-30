import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export enum AuthLevel {
  None = 'none', // No authentication required
  User = 'user', // User authentication required
  Admin = 'admin', // Admin authentication required
}

const withAuth = (WrappedComponent: React.ComponentType, authLevel: AuthLevel = AuthLevel.None) => {
  const WithAuth: React.FC = (props: any) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      if (loading) return; // Still loading auth state

      if (authLevel === AuthLevel.None) {
        // No authentication required
        setIsAuthorized(true);
        return;
      }

      if (!user) {
        // User not authenticated but authentication required
        const currentPath = router.asPath;
        router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
        return;
      }

      if (authLevel === AuthLevel.Admin && user.role !== 'admin') {
        // Admin authentication required but user is not admin
        router.push('/trade');
        return;
      }

      // User is authenticated and meets the required auth level
      setIsAuthorized(true);
    }, [user, loading, router, authLevel]);

    if (loading) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!isAuthorized) {
      return null; // Don't render anything while redirecting
    }

    return <WrappedComponent {...props} />;
  };

  // Copy getInitialProps so it will run as well
  if ((WrappedComponent as any).getInitialProps) {
    (WithAuth as any).getInitialProps = (WrappedComponent as any).getInitialProps;
  }

  return WithAuth;
};

export default withAuth;
