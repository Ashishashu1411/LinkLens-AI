import { lazy, Suspense } from 'react';
import { 
  createRootRoute, 
  createRoute, 
  createRouter, 
  RouterProvider,
  Outlet
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import Layout from './components/Layout';
import Home from './routes/home';
import Scanner from './routes/scanner';
import History from './routes/history';
import About from './routes/about';
import ExtensionInstall from './routes/extension-install';
import Privacy from './routes/privacy';
import Terms from './routes/terms';
import Contact from './routes/contact';

const Analytics = lazy(() => import('./routes/analytics'));

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

// Create root route with the global layout
const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  )
});

// Define page routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home
});

const scannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scanner',
  component: Scanner
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: History
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics',
  component: () => (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading analytics...</div>}>
      <Analytics />
    </Suspense>
  )
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: About
});

const extensionInstallRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/extension',
  component: ExtensionInstall
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy',
  component: Privacy
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: Terms
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: Contact
});

// Build route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  scannerRoute,
  historyRoute,
  analyticsRoute,
  aboutRoute,
  extensionInstallRoute,
  privacyRoute,
  termsRoute,
  contactRoute
]);

// Build router instance
const router = createRouter({ routeTree });

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster 
        theme="dark" 
        position="bottom-right" 
        toastOptions={{
          className: 'sonner-toast-custom'
        }}
      />
    </QueryClientProvider>
  );
}
