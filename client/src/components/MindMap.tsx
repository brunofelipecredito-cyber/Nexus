import React, { useState, useCallback, useContext, createContext, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Plus, RefreshCw, Trash2, Edit2, Zap, Download, ChevronDown, ChevronUp } from "lucide-react";
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  Handle,
  Position,
  NodeProps,
  NodeResizer,
  ReactFlowProvider
} from '@xyflow/react';
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toPng } from 'html-to-image';

const MindMapContext = createContext<{
  onEdit: (id: string, label: string) => void;
  onDelete: (id: string) => void;
}>({ onEdit: () => {}, onDelete: () => {} });

const CustomNode = ({ id, data, isConnectable, selected }: NodeProps) => {
  const { onEdit, onDelete } = useContext(MindMapContext);
  return (
    <>
      <NodeResizer minWidth={120} minHeight={60} isVisible={selected} lineClassName="border-primary" handleClassName="h-3 w-3 bg-primary border-2 border-background" />
      <div className="relative group w-full h-full flex flex-col items-center justify-center">
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-4 h-4 bg-muted-foreground" />
        <div className={`w-full h-full min-w-[120px] min-h-[60px] px-3 py-2 rounded-xl border-4 shadow-md flex items-center justify-center ${data.customStyle}`}>
          <div className="font-bold text-sm text-center leading-snug break-words max-w-full">{String(data.label || '')}</div>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border/50 rounded-lg p-1.5 shadow-xl z-50">
            <button onClick={() => onEdit(id, String(data.label))} className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground" title="Editar">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(id)} className="p-1 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive" title="Excluir">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-4 h-4 bg-muted-foreground" />
      </div>
    </>
  );
};

const nodeTypes = { custom: CustomNode };

const defaultNodes: Node[] = [
  {
    id: '1',
    position: { x: 80, y: 60 },
    data: { label: 'Processo de Vendas (Atual)', customStyle: 'bg-card border-border text-foreground' },
    type: 'custom',
    style: { width: 220, height: 80 }
  },
];

function MindMapInner() {
  const [nodes, setNodes] = useLocalStorage<Node[]>('nexus-mindmap-nodes', defaultNodes);
  const [edges, setEdges] = useLocalStorage<Edge[]>('nexus-mindmap-edges', []);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [nodeType, setNodeType] = useState<'process' | 'bottleneck' | 'solution'>('process');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<{id: string, label: string} | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const { toast } = useToast();
  const flowRef = useRef<HTMLDivElement>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]
  );
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]
  );

  function getStyleClasses(type: string) {
    if (type === 'bottleneck') return 'bg-destructive/10 border-destructive text-destructive';
    if (type === 'solution') return 'bg-primary/10 border-primary text-primary';
    return 'bg-card border-border text-foreground';
  }

  const addNode = () => {
    if (!newNodeLabel.trim()) return;
    const newNode: Node = {
      id: Math.random().toString(36).substr(2, 9),
      position: { x: Math.random() * 200 + 30, y: Math.random() * 150 + 30 },
      type: 'custom',
      data: { label: newNodeLabel, customStyle: getStyleClasses(nodeType), type: nodeType },
      style: { width: 220, height: 80 }
    };
    setNodes((nds) => [...nds, newNode]);
    setNewNodeLabel('');
    setPanelOpen(false);
    toast({ title: "Nó adicionado", description: "Nó adicionado ao mapa mental." });
  };

  const handleEditSave = () => {
    if (!editingNode) return;
    setNodes((nds) => nds.map(node => node.id === editingNode.id ? { ...node, data: { ...node.data, label: editingNode.label } } : node));
    setIsEditDialogOpen(false);
    setEditingNode(null);
  };

  const handleDelete = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }, [setNodes, setEdges]);

  const handleEdit = useCallback((id: string, label: string) => {
    setEditingNode({ id, label });
    setIsEditDialogOpen(true);
  }, []);

  const handleReset = () => {
    if (confirm("Tem certeza que deseja apagar todo o mapa?")) {
      setNodes(defaultNodes);
      setEdges([]);
    }
  };

  const handleExport = async () => {
    const container = flowRef.current?.querySelector('.react-flow') as HTMLElement | null;
    if (!container) {
      toast({ title: "Erro", description: "Não foi possível capturar o mapa.", variant: "destructive" });
      return;
    }
    setIsExporting(true);
    try {
      const dataUrl = await toPng(container, { backgroundColor: '#0f172a', width: container.offsetWidth, height: container.offsetHeight });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `nexus-arquitetura-${new Date().toISOString().split('T')[0]}.png`;
      a.click();
      toast({ title: "Mapa exportado!", description: "A imagem PNG foi baixada com sucesso." });
    } catch {
      toast({ title: "Erro na exportação", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const typeOptions = [
    { value: 'process' as const, label: 'Processo', dot: 'bg-muted-foreground' },
    { value: 'bottleneck' as const, label: 'Gargalo', dot: 'bg-destructive' },
    { value: 'solution' as const, label: 'Solução', dot: 'bg-primary' },
  ];

  return (
    <div className="flex flex-col gap-3 pb-24 animate-in fade-in duration-500" style={{ height: 'calc(100dvh - 130px)', minHeight: '500px' }}>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 shrink-0">
        <Card className="py-2 px-3 flex items-center justify-between border-border/50 shadow-sm">
          <div><p className="text-[10px] text-muted-foreground">Nós</p><p className="text-base md:text-xl font-bold">{nodes.length}</p></div>
          <AlertCircle className="w-4 h-4 text-primary opacity-60" />
        </Card>
        <Card className="py-2 px-3 flex items-center justify-between border-border/50 shadow-sm">
          <div><p className="text-[10px] text-muted-foreground">Gargalos</p><p className="text-base md:text-xl font-bold text-destructive">{nodes.filter(n => n.data.type === 'bottleneck').length}</p></div>
          <AlertCircle className="w-4 h-4 text-destructive opacity-60" />
        </Card>
        <Card className="py-2 px-3 flex items-center justify-between border-border/50 shadow-sm">
          <div><p className="text-[10px] text-muted-foreground">Soluções</p><p className="text-base md:text-xl font-bold text-primary">{nodes.filter(n => n.data.type === 'solution').length}</p></div>
          <Zap className="w-4 h-4 text-primary opacity-60" />
        </Card>
      </div>

      {/* Title + Actions */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <h2 className="text-lg md:text-2xl font-display font-bold tracking-tight truncate">Arquitetura e Processos</h2>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting} className="h-8 px-2 text-xs">
            <Download className="w-3.5 h-3.5" /><span className="hidden sm:inline ml-1">{isExporting ? 'Exportando...' : 'PNG'}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="h-8 px-2 text-xs">
            <RefreshCw className="w-3.5 h-3.5" /><span className="hidden sm:inline ml-1">Resetar</span>
          </Button>
          <Button size="sm" onClick={() => setPanelOpen(o => !o)} className="h-8 px-2 text-xs md:hidden">
            <Plus className="w-3.5 h-3.5" />{panelOpen ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
          </Button>
        </div>
      </div>

      {/* Mobile collapsible add panel */}
      {panelOpen && (
        <Card className="border-border/50 shadow-sm shrink-0 md:hidden">
          <CardContent className="p-3 space-y-2.5">
            <div className="flex gap-1.5">
              {typeOptions.map(t => (
                <button key={t.value} onClick={() => setNodeType(t.value)}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all ${nodeType === t.value ? 'bg-muted border-border text-foreground' : 'border-border/40 text-muted-foreground'}`}>
                  <div className={`w-2 h-2 rounded-full ${t.dot}`} />{t.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Nome do elemento..." value={newNodeLabel} onChange={e => setNewNodeLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNode()} className="h-9 text-sm flex-1" />
              <Button size="sm" className="h-9 px-3 shrink-0" onClick={addNode}><Plus className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main content: side-by-side on desktop, map-only on mobile */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 md:gap-6">

        {/* Desktop sidebar panel */}
        <Card className="hidden md:flex flex-col w-64 shrink-0 border-border/50 shadow-md overflow-y-auto">
          <CardHeader className="pb-3 p-5 shrink-0">
            <CardTitle className="text-lg">Painel de Criação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 flex-1 p-5">
            <div className="space-y-2">
              <Label className="text-sm">Tipo de Elemento</Label>
              <div className="flex flex-col gap-2">
                {typeOptions.map(t => (
                  <button key={t.value} onClick={() => setNodeType(t.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all text-left ${nodeType === t.value ? 'bg-muted border-border text-foreground' : 'border-border/40 text-muted-foreground hover:bg-muted/50'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${t.dot}`} />{t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Título do Elemento</Label>
              <Input placeholder="Ex: Falta de follow-up" value={newNodeLabel} className="h-10" onChange={e => setNewNodeLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNode()} />
            </div>
            <Button className="w-full h-10" onClick={addNode}><Plus className="w-4 h-4 mr-2" />Inserir no Mapa</Button>
          </CardContent>
        </Card>

        {/* Map — fills all remaining space */}
        <Card className="flex-1 min-h-0 border-border/50 shadow-md overflow-hidden rounded-xl md:rounded-2xl">
          <div className="h-full w-full" ref={flowRef}>
            <MindMapContext.Provider value={{ onEdit: handleEdit, onDelete: handleDelete }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              >
                <Controls />
                <Background color="hsl(var(--muted-foreground))" gap={28} size={1.5} />
              </ReactFlow>
            </MindMapContext.Provider>
          </div>
        </Card>

      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Nó</DialogTitle>
            <DialogDescription>Altere o texto do elemento selecionado.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input className="h-11" value={editingNode?.label || ''} onChange={e => setEditingNode(prev => prev ? { ...prev, label: e.target.value } : null)} onKeyDown={e => e.key === 'Enter' && handleEditSave()} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditSave}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MindMap() {
  return (
    <ReactFlowProvider>
      <MindMapInner />
    </ReactFlowProvider>
  );
}
