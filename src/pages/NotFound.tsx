import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      
      <div className="flex-1 flex items-center justify-center py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 text-foreground">404</h1>
          <p className="text-xl text-muted-foreground mb-6">Oops! Página não encontrada</p>
          <p className="text-muted-foreground mb-8">A página que você está procurando não existe ou foi movida.</p>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Voltar para Home
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotFound;
