import { useThemeConfig } from "@/hooks/use-theme-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, Database, Palette, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ConfigPanel() {
  const { toast } = useToast();
  const { config, setConfig } = useThemeConfig();

  const handleClearData = () => {
    window.localStorage.clear();
    toast({
      title: "Dados Apagados",
      description: "O armazenamento local foi limpo. A página será recarregada.",
      variant: "destructive"
    });
    setTimeout(() => window.location.reload(), 1500);
  };

  const updateConfig = (updates: Partial<typeof config>) => {
    setConfig({ ...config, ...updates });
  };

  const colors = [
    { name: "Azul (Padrão)", value: "221 83% 53%", bg: "bg-blue-500" },
    { name: "Roxo", value: "271 81% 56%", bg: "bg-purple-500" },
    { name: "Verde", value: "142 71% 45%", bg: "bg-emerald-500" },
    { name: "Laranja", value: "25 95% 53%", bg: "bg-orange-500" },
    { name: "Rosa", value: "330 81% 60%", bg: "bg-pink-500" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-display font-bold tracking-tight mb-2 flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Configurações Completas
        </h2>
        <p className="text-muted-foreground">
          Personalize totalmente o sistema (sem código) e gerencie seus dados locais.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Aparência e UI */}
        <Card className="border-border/50 shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="w-5 h-5 text-primary" />
              Aparência e Interface
            </CardTitle>
            <CardDescription>Defina a cor principal, o tema e o formato dos elementos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label>Tema do Sistema</Label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="dark-mode" 
                    checked={config.isDark} 
                    onCheckedChange={(v) => updateConfig({ isDark: v })}
                  />
                  <Label htmlFor="dark-mode">Modo Escuro Ativado</Label>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Arredondamento das Bordas (Radius)</Label>
                <Select value={config.radius} onValueChange={(v) => updateConfig({ radius: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o arredondamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0rem">Quadrado (0rem)</SelectItem>
                    <SelectItem value="0.3rem">Leve (0.3rem)</SelectItem>
                    <SelectItem value="0.5rem">Médio (0.5rem)</SelectItem>
                    <SelectItem value="0.75rem">Arredondado (0.75rem)</SelectItem>
                    <SelectItem value="1rem">Super Arredondado (1rem)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label>Cor Principal do Sistema</Label>
                <div className="flex flex-wrap gap-4">
                  {colors.map(color => (
                    <button 
                      key={color.value}
                      onClick={() => updateConfig({ primaryColor: color.value })}
                      className={`w-12 h-12 rounded-full ${color.bg} transition-all ${
                        config.primaryColor === color.value ? 'ring-4 ring-offset-4 ring-primary ring-offset-background scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Armazenamento */}
        <Card className="border-border/50 shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="w-5 h-5 text-primary" />
              Armazenamento e Dados Locais
            </CardTitle>
            <CardDescription>Gerencie os dados que persistem automaticamente no seu navegador.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
              <Trash2 className="w-4 h-4" />
              <AlertTitle>Apagar Tudo (Factory Reset)</AlertTitle>
              <AlertDescription className="mt-2 flex flex-col gap-3">
                Aviso: Isso excluirá permanentemente todos os registros de clientes, mapas mentais, fluxos e configurações do seu navegador local.
                <Button variant="destructive" size="sm" className="w-fit" onClick={handleClearData}>
                  Sim, Excluir Todos os Dados
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}