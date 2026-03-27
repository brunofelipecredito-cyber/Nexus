import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Mail, CheckCircle2, TrendingUp, Presentation, Database, Network, DollarSign, Users, BarChart2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function PresentationReport() {
  const { toast } = useToast();
  const [reportSource, setReportSource] = useState<'crm' | 'arquitetura'>('crm');
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");

  const [crmClients] = useLocalStorage<any[]>('nexus-crm-clients', []);
  const [archNodes] = useLocalStorage<any[]>('nexus-mindmap-nodes', []);
  const [funnelNodes] = useLocalStorage<any[]>('nexus-funnel-nodes', []);

  const totalCrm = crmClients.length;
  const closedCrm = crmClients.filter((c: any) => c.isClosed);
  const activeCrm = crmClients.filter((c: any) => !c.isClosed);
  const crmConversion = totalCrm > 0 ? Math.round((closedCrm.length / totalCrm) * 100) : 0;

  const totalRevenue = closedCrm.reduce((acc: number, c: any) => acc + (c.saleValue || 0), 0);
  const totalCost = closedCrm.reduce((acc: number, c: any) => acc + (c.costValue || 0), 0);
  const totalProfit = totalRevenue - totalCost;
  const totalCommission = totalProfit > 0 ? totalProfit * 0.1 : 0;
  const ticketMedio = closedCrm.length > 0 ? totalRevenue / closedCrm.length : 0;
  const margemMedia = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  const bottlenecks = archNodes.filter((n: any) => n.data?.type === 'bottleneck').length;
  const solutions = archNodes.filter((n: any) => n.data?.type === 'solution').length;
  const processes = archNodes.filter((n: any) => n.data?.type === 'process' || !n.data?.type).length;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getReportText = () => {
    const date = new Date().toLocaleDateString('pt-BR');
    if (reportSource === 'crm') {
      return `NEXUS - Relatório CRM (${date})
Total de Clientes: ${totalCrm}
Vendas Fechadas: ${closedCrm.length}
Negociações Ativas: ${activeCrm.length}
Conversão: ${crmConversion}%
Faturamento Total: ${formatCurrency(totalRevenue)}
Lucro Total: ${formatCurrency(totalProfit)}
Comissão (10%): ${formatCurrency(totalCommission)}
Ticket Médio: ${formatCurrency(ticketMedio)}
Margem Média: ${margemMedia}%`;
    } else {
      return `NEXUS - Relatório Arquitetura (${date})
Total de Nós: ${archNodes.length}
Processos Mapeados: ${processes}
Gargalos Identificados: ${bottlenecks}
Soluções Propostas: ${solutions}
Etapas do Funil: ${funnelNodes.length}`;
    }
  };

  const handleExportPDF = () => {
    const text = getReportText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-relatorio-${reportSource}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Relatório exportado!", description: "O arquivo foi baixado com sucesso." });
  };

  const handleSendEmail = () => {
    if (!emailAddress || !emailAddress.includes('@')) {
      toast({ title: "E-mail inválido", description: "Informe um endereço de e-mail válido.", variant: "destructive" });
      return;
    }
    const subject = encodeURIComponent(`Relatório NEXUS - ${reportSource === 'crm' ? 'CRM' : 'Arquitetura'} - ${new Date().toLocaleDateString('pt-BR')}`);
    const body = encodeURIComponent(getReportText());
    window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
    setIsEmailDialogOpen(false);
    toast({ title: "E-mail preparado!", description: `O relatório foi aberto no seu cliente de e-mail para envio a ${emailAddress}.` });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <Presentation className="w-7 h-7 text-primary" />
            Central de Relatórios
          </h2>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Gere apresentações com base nos dados do sistema.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setIsEmailDialogOpen(true)} className="flex-1 sm:flex-none h-10 md:h-12 px-3 md:px-6">
            <Mail className="w-4 h-4 mr-2" /><span className="hidden sm:inline">Enviar por </span>E-mail
          </Button>
          <Button onClick={handleExportPDF} className="flex-1 sm:flex-none h-10 md:h-12 px-3 md:px-6 shadow-lg shadow-primary/20">
            <Download className="w-4 h-4 mr-2" />Exportar
          </Button>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm bg-muted/20">
        <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1 w-full space-y-2">
            <Label className="text-sm text-muted-foreground">Selecione a origem dos dados</Label>
            <Select value={reportSource} onValueChange={(v: 'crm' | 'arquitetura') => setReportSource(v)}>
              <SelectTrigger className="w-full h-11 bg-background">
                <SelectValue placeholder="Selecione o módulo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crm">
                  <div className="flex items-center gap-2"><Database className="w-4 h-4 text-blue-500" />Módulo CRM de Vendas</div>
                </SelectItem>
                <SelectItem value="arquitetura">
                  <div className="flex items-center gap-2"><Network className="w-4 h-4 text-purple-500" />Módulo de Arquitetura</div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            O relatório é gerado dinamicamente com dados reais do painel.
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <div className="bg-muted/30 p-3 md:p-8 rounded-2xl border-2 border-border/50">
        <Card className="max-w-4xl mx-auto shadow-2xl border-none bg-card overflow-hidden">

          <div className={`p-6 md:p-10 text-white ${reportSource === 'crm' ? 'bg-blue-600' : 'bg-purple-600'}`}>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-white/80 font-bold mb-2 tracking-widest text-xs uppercase">Relatório Executivo — {new Date().toLocaleDateString('pt-BR')}</div>
                <h1 className="text-2xl md:text-4xl font-display font-bold mb-3 leading-tight">
                  {reportSource === 'crm' ? 'Performance Comercial & CRM' : 'Diagnóstico de Processos & Arquitetura'}
                </h1>
                <p className="text-white/90 text-sm md:text-base">
                  {reportSource === 'crm'
                    ? 'Análise do funil de negociações, taxas de conversão, lucro e comissionamento de veículos.'
                    : 'Mapeamento visual de gargalos e proposta de soluções e automações operacionais.'}
                </p>
              </div>
              <div className="w-14 h-14 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
                {reportSource === 'crm' ? <Database className="w-7 h-7 md:w-10 md:h-10 text-white" /> : <Network className="w-7 h-7 md:w-10 md:h-10 text-white" />}
              </div>
            </div>
          </div>

          <CardContent className="p-5 md:p-10 space-y-8 md:space-y-12">

            {reportSource === 'crm' ? (
              <>
                {/* Section 01 – Funil */}
                <section>
                  <h3 className="text-xl md:text-2xl font-bold font-display border-b border-border/50 pb-3 mb-6 flex items-center gap-3">
                    <span className="bg-blue-500/10 text-blue-600 w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0">01</span>
                    Resumo do Funil de Negócios
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-muted/50 border border-border rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold font-display">{totalCrm}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1 font-medium">Total de Contatos</div>
                    </div>
                    <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-green-600 font-display">{closedCrm.length}</div>
                      <div className="text-xs text-green-600/80 uppercase tracking-wider mt-1 font-medium">Vendas Fechadas</div>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-center col-span-2 md:col-span-1">
                      <div className="text-3xl font-bold text-blue-600 font-display">{crmConversion}%</div>
                      <div className="text-xs text-blue-600/80 uppercase tracking-wider mt-1 font-medium">Taxa de Conversão</div>
                    </div>
                  </div>
                </section>

                {/* Section 02 – Financeiro */}
                <section>
                  <h3 className="text-xl md:text-2xl font-bold font-display border-b border-border/50 pb-3 mb-6 flex items-center gap-3">
                    <span className="bg-blue-500/10 text-blue-600 w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0">02</span>
                    Análise Financeira Completa
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 bg-muted/30 border border-border/50 rounded-xl p-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                        <BarChart2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Faturamento Total</div>
                        <div className="text-xl font-bold">{formatCurrency(totalRevenue)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Lucro Total</div>
                        <div className="text-xl font-bold text-green-600">{formatCurrency(totalProfit)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-primary/5 border border-primary/20 rounded-xl p-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <DollarSign className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Comissão Total (10%)</div>
                        <div className="text-xl font-bold text-primary">{formatCurrency(totalCommission)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-muted/30 border border-border/50 rounded-xl p-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Ticket Médio</div>
                        <div className="text-xl font-bold">{formatCurrency(ticketMedio)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-muted/20 border border-border/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold">{margemMedia}%</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Margem Média</div>
                    </div>
                    <div className="bg-muted/20 border border-border/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold">{activeCrm.length}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Negociações Ativas</div>
                    </div>
                  </div>
                </section>

                {/* Section 03 – Insights */}
                <section>
                  <h3 className="text-xl md:text-2xl font-bold font-display border-b border-border/50 pb-3 mb-6 flex items-center gap-3">
                    <span className="bg-blue-500/10 text-blue-600 w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0">03</span>
                    Insights e Recomendações
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                      <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-base font-bold mb-1">Qualificação de Leads</h4>
                        <p className="text-muted-foreground text-sm">Contatos com orçamento pré-definido têm 3x mais chance de converter. Mantenha as anotações do CRM atualizadas para medir o ticket médio e identificar os perfis mais lucrativos.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-base font-bold mb-1">Otimização de Margem</h4>
                        <p className="text-muted-foreground text-sm">A margem média atual é de <strong>{margemMedia}%</strong>. Identifique os veículos com maior margem e priorize-os no funil para maximizar o lucro por negociação.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-base font-bold mb-1">Pipeline Ativo</h4>
                        <p className="text-muted-foreground text-sm">Há <strong>{activeCrm.length}</strong> negociações em andamento. Se fechadas com o ticket atual, representam um potencial adicional de <strong>{formatCurrency(activeCrm.reduce((a: number, c: any) => a + (c.saleValue - c.costValue), 0))}</strong> em lucro bruto.</p>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h3 className="text-xl md:text-2xl font-bold font-display border-b border-border/50 pb-3 mb-6 flex items-center gap-3">
                    <span className="bg-purple-500/10 text-purple-600 w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0">01</span>
                    Diagnóstico Estrutural
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-muted/30 border border-border/50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold">{processes}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Processos Mapeados</div>
                    </div>
                    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-destructive">{bottlenecks}</div>
                      <div className="text-xs text-destructive/80 uppercase tracking-wider mt-1">Gargalos Críticos</div>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-primary">{solutions}</div>
                      <div className="text-xs text-primary/80 uppercase tracking-wider mt-1">Soluções Propostas</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-muted/20 border border-border/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold">{archNodes.length}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total de Nós no Mapa</div>
                    </div>
                    <div className="bg-muted/20 border border-border/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold">{funnelNodes.length}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Etapas do Funil</div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl md:text-2xl font-bold font-display border-b border-border/50 pb-3 mb-6 flex items-center gap-3">
                    <span className="bg-purple-500/10 text-purple-600 w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0">02</span>
                    Diagnóstico de Gargalos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5">
                      <h4 className="font-bold text-destructive mb-2 text-base">{bottlenecks} Gargalos Identificados</h4>
                      <p className="text-sm text-muted-foreground">Pontos críticos mapeados que estão impactando negativamente a operação e aumentando custos. Cada gargalo deve ter uma solução correspondente no mapa.</p>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
                      <h4 className="font-bold text-primary mb-2 text-base">{solutions} Soluções Propostas</h4>
                      <p className="text-sm text-muted-foreground">Iniciativas mapeadas para contornar os gargalos identificados. A taxa de cobertura atual é de <strong>{bottlenecks > 0 ? Math.round((solutions / bottlenecks) * 100) : 100}%</strong>.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl md:text-2xl font-bold font-display border-b border-border/50 pb-3 mb-6 flex items-center gap-3">
                    <span className="bg-purple-500/10 text-purple-600 w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0">03</span>
                    Plano de Ação
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                      <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-base font-bold mb-1">Reestruturação do Fluxo</h4>
                        <p className="text-muted-foreground text-sm">Substituir processos manuais por automações. Cada nó de "Solução" representa um projeto de implementação prioritário.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-base font-bold mb-1">Integração de Sistemas</h4>
                        <p className="text-muted-foreground text-sm">Centralizar operações no Nexus, garantindo que o mapa arquitetural reflita diretamente no uso do CRM e Funil.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-base font-bold mb-1">Monitoramento Contínuo</h4>
                        <p className="text-muted-foreground text-sm">Revisar o mapa mensalmente para atualizar gargalos resolvidos e incluir novos desafios operacionais conforme o negócio escala.</p>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </CardContent>

          <div className="bg-muted p-4 md:p-6 text-center text-xs text-muted-foreground border-t border-border/50 uppercase tracking-widest font-bold">
            Documento gerado confidencialmente pelo Sistema NEXUS • {new Date().toLocaleDateString('pt-BR')}
          </div>
        </Card>
      </div>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Relatório por E-mail</DialogTitle>
            <DialogDescription>Informe o e-mail de destino. O relatório será aberto no seu cliente de e-mail para envio.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Label htmlFor="email-dest">Endereço de E-mail</Label>
            <Input
              id="email-dest"
              type="email"
              placeholder="destinatario@empresa.com"
              value={emailAddress}
              onChange={e => setEmailAddress(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendEmail()}
            />
            <p className="text-xs text-muted-foreground">
              Módulo selecionado: <strong>{reportSource === 'crm' ? 'CRM de Vendas' : 'Arquitetura'}</strong>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSendEmail}><Mail className="w-4 h-4 mr-2" />Abrir no E-mail</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
