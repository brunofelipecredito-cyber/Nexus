import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Phone, CarFront, CheckCircle, Pencil, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface CarClient {
  id: string;
  name: string;
  phone: string;
  carModel: string;
  year: string;
  plate: string;
  saleValue: number;
  costValue: number;
  observation: string;
  isClosed: boolean;
  dateAdded: string;
}

const initialClients: CarClient[] = [
  {
    id: "1",
    name: "João Silva",
    phone: "5511999999999",
    carModel: "Honda Civic",
    year: "2020",
    plate: "ABC-1234",
    saleValue: 95000,
    costValue: 80000,
    observation: "Cliente aguardando aprovação de financiamento no banco.",
    isClosed: false,
    dateAdded: "2023-10-15",
  },
  {
    id: "2",
    name: "Maria Oliveira",
    phone: "5511988888888",
    carModel: "Toyota Corolla",
    year: "2022",
    plate: "XYZ-5678",
    saleValue: 120000,
    costValue: 105000,
    observation: "Venda concluída com sucesso. Veículo entregue.",
    isClosed: true,
    dateAdded: "2023-10-20",
  },
  {
    id: "3",
    name: "Pedro Santos",
    phone: "5511977777777",
    carModel: "VW Hilux",
    year: "2019",
    plate: "DEF-9012",
    saleValue: 150000,
    costValue: 130000,
    observation: "Primeiro contato, ofereceu uma moto na troca.",
    isClosed: false,
    dateAdded: "2023-10-25",
  },
];

const emptyClient: Partial<CarClient> = {
  observation: "",
  isClosed: false,
};

interface ClientFormFieldsProps {
  data: Partial<CarClient>;
  onChange: (d: Partial<CarClient>) => void;
  formatCurrency: (value: number) => string;
  calculateProfit: (sale: number, cost: number) => number;
  calculateCommission: (sale: number, cost: number) => number;
}

function ClientFormFields({
  data,
  onChange,
  formatCurrency,
  calculateProfit,
  calculateCommission,
}: ClientFormFieldsProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="f-name">Nome do Cliente *</Label>
          <Input
            id="f-name"
            value={data.name || ""}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="Ex: Carlos Mendes"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="f-phone">Telefone / WhatsApp</Label>
          <Input
            id="f-phone"
            value={data.phone || ""}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            placeholder="Ex: 5511999999999"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="f-model">Modelo do Veículo *</Label>
          <Input
            id="f-model"
            value={data.carModel || ""}
            onChange={(e) => onChange({ ...data, carModel: e.target.value })}
            placeholder="Ex: Jeep Compass XEI"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="f-year">Ano</Label>
          <Input
            id="f-year"
            value={data.year || ""}
            onChange={(e) => onChange({ ...data, year: e.target.value })}
            placeholder="Ex: 2023"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="f-sale">Valor de Venda (R$) *</Label>
          <Input
            id="f-sale"
            type="number"
            value={data.saleValue ?? ""}
            onChange={(e) =>
              onChange({
                ...data,
                saleValue: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            placeholder="Ex: 150000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="f-cost">Custo do Veículo (R$) *</Label>
          <Input
            id="f-cost"
            type="number"
            value={data.costValue ?? ""}
            onChange={(e) =>
              onChange({
                ...data,
                costValue: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            placeholder="Ex: 130000"
          />
        </div>
      </div>

      {data.saleValue !== undefined &&
        data.costValue !== undefined &&
        Number(data.saleValue) > 0 && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 text-sm text-green-700 dark:text-green-400">
            Lucro estimado:{" "}
            <strong>
              {formatCurrency(
                calculateProfit(Number(data.saleValue), Number(data.costValue))
              )}
            </strong>{" "}
            — Comissão 10%:{" "}
            <strong>
              {formatCurrency(
                calculateCommission(Number(data.saleValue), Number(data.costValue))
              )}
            </strong>
          </div>
        )}

      <div className="space-y-2">
        <Label htmlFor="f-plate">Placa</Label>
        <Input
          id="f-plate"
          value={data.plate || ""}
          onChange={(e) => onChange({ ...data, plate: e.target.value })}
          placeholder="Ex: ABC-1234"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="f-obs">Observação / Status Manual</Label>
        <Textarea
          id="f-obs"
          value={data.observation || ""}
          onChange={(e) => onChange({ ...data, observation: e.target.value })}
          placeholder="Descreva o andamento da negociação..."
          className="min-h-[80px]"
        />
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Switch
          id="f-closed"
          checked={!!data.isClosed}
          onCheckedChange={(v) => onChange({ ...data, isClosed: v })}
        />
        <Label htmlFor="f-closed">Marcar como negócio fechado (já vendido)</Label>
      </div>
    </div>
  );
}

export default function CRM() {
  const [clients, setClients] = useLocalStorage<CarClient[]>("nexus-crm-clients", initialClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<CarClient | null>(null);
  const { toast } = useToast();

  const [newClient, setNewClient] = useState<Partial<CarClient>>(emptyClient);

  const calculateProfit = (sale: number, cost: number) => {
    return sale - cost > 0 ? sale - cost : 0;
  };

  const calculateCommission = (sale: number, cost: number) => {
    const profit = sale - cost;
    return profit > 0 ? profit * 0.1 : 0;
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleAddClient = () => {
    if (
      !newClient.name ||
      !newClient.carModel ||
      newClient.saleValue === undefined ||
      newClient.costValue === undefined
    ) {
      toast({
        title: "Erro de Validação",
        description: "Preencha os campos obrigatórios (Nome, Modelo, Valor de Venda, Custo).",
        variant: "destructive",
      });
      return;
    }

    const client: CarClient = {
      id: crypto.randomUUID(),
      name: newClient.name,
      phone: newClient.phone || "",
      carModel: newClient.carModel,
      year: newClient.year || "",
      plate: newClient.plate || "",
      saleValue: Number(newClient.saleValue),
      costValue: Number(newClient.costValue),
      observation: newClient.observation || "",
      isClosed: newClient.isClosed || false,
      dateAdded: new Date().toISOString().split("T")[0],
    };

    setClients([client, ...clients]);
    setIsAddDialogOpen(false);
    setNewClient(emptyClient);

    toast({
      title: "Cliente Adicionado",
      description: `${client.name} foi adicionado ao CRM com sucesso.`,
    });
  };

  const openEditDialog = (client: CarClient) => {
    setEditingClient({ ...client });
    setIsEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (!editingClient) return;

    if (!editingClient.name || !editingClient.carModel) {
      toast({
        title: "Erro de Validação",
        description: "Nome e Modelo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setClients(
      clients.map((c) =>
        c.id === editingClient.id
          ? {
              ...editingClient,
              saleValue: Number(editingClient.saleValue),
              costValue: Number(editingClient.costValue),
            }
          : c
      )
    );

    setIsEditDialogOpen(false);
    setEditingClient(null);

    toast({
      title: "Dados Atualizados",
      description: "As informações do cliente foram salvas com sucesso.",
    });
  };

  const handleDelete = (id: string) => {
    setClients(clients.filter((c) => c.id !== id));
    toast({
      title: "Registro Excluído",
      description: "O cliente foi removido da base de dados.",
    });
  };

  const toggleClosed = (id: string) => {
    setClients(clients.map((c) => (c.id === id ? { ...c, isClosed: !c.isClosed } : c)));
  };

  const updateObservation = (id: string, newObs: string) => {
    setClients(clients.map((c) => (c.id === id ? { ...c, observation: newObs } : c)));
  };

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      return (
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.carModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.plate.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [clients, searchTerm]);

  const closedClients = clients.filter((c) => c.isClosed);
  const totalSales = closedClients.reduce((acc, curr) => acc + curr.saleValue, 0);
  const totalProfit = closedClients.reduce(
    (acc, curr) => acc + calculateProfit(curr.saleValue, curr.costValue),
    0
  );
  const totalCommission = closedClients.reduce(
    (acc, curr) => acc + calculateCommission(curr.saleValue, curr.costValue),
    0
  );
  const activeNegotiations = clients.filter((c) => !c.isClosed).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-sm">
          <CardHeader className="pb-2 p-4 md:p-6">
            <CardDescription className="text-xs md:text-sm">Vendas Concluídas</CardDescription>
            <CardTitle className="text-xl md:text-3xl">{formatCurrency(totalSales)}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <p className="text-xs text-muted-foreground">Volume total em veículos entregues</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-card border-green-500/20 shadow-sm">
          <CardHeader className="pb-2 p-4 md:p-6">
            <CardDescription className="text-green-700 dark:text-green-400 font-medium text-xs md:text-sm">
              Lucro Total
            </CardDescription>
            <CardTitle className="text-xl md:text-3xl text-green-600 dark:text-green-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
              {formatCurrency(totalProfit)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <p className="text-xs text-muted-foreground">Lucro real das vendas fechadas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-card border-primary/20 shadow-sm">
          <CardHeader className="pb-2 p-4 md:p-6">
            <CardDescription className="text-primary/80 font-medium text-xs md:text-sm">
              Comissão Total (10%)
            </CardDescription>
            <CardTitle className="text-xl md:text-3xl text-primary">
              {formatCurrency(totalCommission)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <p className="text-xs text-muted-foreground">Ganhos reais acumulados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-sm">
          <CardHeader className="pb-2 p-4 md:p-6">
            <CardDescription className="text-xs md:text-sm">Negociações Ativas</CardDescription>
            <CardTitle className="text-xl md:text-3xl">{activeNegotiations}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <p className="text-xs text-muted-foreground">Atendimentos em andamento</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <CarFront className="w-5 h-5 text-primary" />
              Gestão de Clientes e Veículos
            </CardTitle>
            <CardDescription>Gerencie contatos, negociações e observações manuais.</CardDescription>
          </div>

          <div className="flex w-full md:w-auto items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente, carro, placa..."
                className="pl-8 bg-background/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shrink-0 shadow-sm">
                  <Plus className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Novo</span>
                  <span className="sm:hidden">+</span>
                </Button>
              </DialogTrigger>

              <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo Registro de Cliente</DialogTitle>
                  <DialogDescription>
                    Adicione um novo cliente e veículo ao funil do CRM.
                  </DialogDescription>
                </DialogHeader>

                <ClientFormFields
                  data={newClient}
                  onChange={setNewClient}
                  formatCurrency={formatCurrency}
                  calculateProfit={calculateProfit}
                  calculateCommission={calculateCommission}
                />

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddClient}>Salvar Cliente</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="md:hidden space-y-3 p-4">
            {filteredClients.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Nenhum cliente encontrado.</p>
            ) : (
              filteredClients.map((client) => {
                const profit = calculateProfit(client.saleValue, client.costValue);
                const commission = calculateCommission(client.saleValue, client.costValue);

                return (
                  <Card
                    key={client.id}
                    className={`border ${
                      client.isClosed ? "border-green-500/30 bg-green-500/5" : "border-border/50"
                    }`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-base">{client.name}</div>
                          <div className="text-xs text-muted-foreground">{client.phone}</div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {client.isClosed && (
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-500/40 text-xs"
                            >
                              Fechado
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-sm font-medium text-primary/90">
                        {client.carModel}{" "}
                        <span className="text-muted-foreground">{client.year}</span>
                      </div>

                      <div className="text-xs text-muted-foreground uppercase tracking-wider">
                        {client.plate || "S/ PLACA"}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs bg-muted/30 rounded-lg p-2">
                        <div>
                          <span className="text-muted-foreground block">Venda</span>
                          <span className="font-medium">{formatCurrency(client.saleValue)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Lucro</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(profit)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Comissão</span>
                          <span className="font-medium text-primary">
                            {formatCurrency(commission)}
                          </span>
                        </div>
                      </div>

                      {client.observation && (
                        <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-2">
                          {client.observation}
                        </p>
                      )}

                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 text-xs"
                          onClick={() => openEditDialog(client)}
                        >
                          <Pencil className="w-3 h-3 mr-1" />
                          Editar
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs border-green-500/30 hover:bg-green-500/10 text-green-600"
                          onClick={() => handleWhatsApp(client.phone)}
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Whats
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs"
                          onClick={() => toggleClosed(client.id)}
                        >
                          <CheckCircle
                            className={`w-4 h-4 ${
                              client.isClosed ? "text-green-500" : "text-muted-foreground"
                            }`}
                          />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(client.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[180px]">Cliente</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Valores & Lucro</TableHead>
                  <TableHead className="w-[260px]">Status / Observação</TableHead>
                  <TableHead className="text-center">Fechado?</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => {
                    const profit = calculateProfit(client.saleValue, client.costValue);
                    const commission = calculateCommission(client.saleValue, client.costValue);

                    return (
                      <TableRow
                        key={client.id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">{client.phone}</div>
                        </TableCell>

                        <TableCell>
                          <div className="font-medium text-primary/90">
                            {client.carModel}
                            <span className="text-muted-foreground text-xs ml-1">
                              {client.year}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 tracking-wider uppercase">
                            {client.plate || "S/ PLACA"}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">Venda: {formatCurrency(client.saleValue)}</div>
                          <div className="text-sm">Custo: {formatCurrency(client.costValue)}</div>
                          <div className="font-semibold text-green-600 dark:text-green-400 text-sm mt-1">
                            Lucro: {formatCurrency(profit)}
                          </div>
                          <div className="text-xs text-primary mt-0.5">
                            Comissão: {formatCurrency(commission)}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Input
                            value={client.observation}
                            onChange={(e) => updateObservation(client.id, e.target.value)}
                            className="h-auto py-2 px-3 text-sm bg-transparent border-transparent hover:border-border focus:bg-background focus:border-ring transition-all"
                            placeholder="Escreva o status..."
                          />
                        </TableCell>

                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`rounded-full w-10 h-10 p-0 ${
                              client.isClosed
                                ? "text-green-500 bg-green-500/10 hover:bg-green-500/20"
                                : "text-muted-foreground hover:bg-muted"
                            }`}
                            onClick={() => toggleClosed(client.id)}
                            title={client.isClosed ? "Negócio Fechado" : "Marcar como Fechado"}
                          >
                            <CheckCircle className="w-6 h-6" />
                          </Button>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => openEditDialog(client)}
                            >
                              <Pencil className="w-3.5 h-3.5 mr-1" />
                              Editar
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-green-500/30 hover:bg-green-500/10 text-green-600"
                              onClick={() => handleWhatsApp(client.phone)}
                            >
                              <Phone className="w-3.5 h-3.5 mr-1" />
                              Whats
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(client.id)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Dados do Cliente</DialogTitle>
            <DialogDescription>
              Altere as informações do cliente e salve as mudanças.
            </DialogDescription>
          </DialogHeader>

          {editingClient && (
            <ClientFormFields
              data={editingClient}
              onChange={(d) => setEditingClient(d as CarClient)}
              formatCurrency={formatCurrency}
              calculateProfit={calculateProfit}
              calculateCommission={calculateCommission}
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSave}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
