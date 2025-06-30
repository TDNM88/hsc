import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export function withAuth(WrappedComponent: React.ComponentType) {
  return function WithAuthWrapper(props: any) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        // Store the current URL for redirecting after login
        const returnUrl = router.asPath;
        router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      }
    }, [user, loading, router]);

    if (loading || !user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
