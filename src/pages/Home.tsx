import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          Seja bem-vindo
        </h1>
        <p className="text-slate-600 text-lg mb-8">
          Sistema de Gerenciamento de Contratos Vivo
        </p>
        
        <Button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mx-auto"
          size="lg"
        >
          Acessar Sistema
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Home;