import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, LockKeyhole } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default credentials as requested: login: bruno, senha: 717874
    if (username === "bruno" && password === "717874") {
      onLogin();
    } else {
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "Credenciais inválidas. Verifique seu usuário e senha.",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-blue-500/5 blur-[100px]"></div>
      </div>

      <Card className="w-full max-w-md z-10 border-border/50 shadow-2xl backdrop-blur-sm bg-card/80">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Car className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-display font-bold tracking-tighter">NEXUS</CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            Gestão Inteligente de Processos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <div className="relative">
                <Input
                  id="username"
                  placeholder="Seu nome de usuário"
                  className="pl-4 h-12 bg-background/50 border-muted"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  data-testid="input-username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  className="pl-4 h-12 bg-background/50 border-muted"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-password"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-md font-semibold mt-4 shadow-lg shadow-primary/20"
              data-testid="button-login"
            >
              <LockKeyhole className="mr-2 w-4 h-4" />
              Entrar no Sistema
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/40 pt-6 pb-6">
          <p className="text-xs text-muted-foreground text-center">
            Acesso restrito. Entre com suas credenciais corporativas.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}