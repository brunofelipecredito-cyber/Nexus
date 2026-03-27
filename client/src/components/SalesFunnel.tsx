import React, { useState, useCallback, useContext, createContext, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Image as ImageIcon, Video, Music, Type, Trash2, ListFilter, PlayCircle, RefreshCw, Download, ChevronDown, ChevronUp } from "lucide-react";
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
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";
import { toPng } from 'html-to-image';

const FunnelContext = createContext<{ onDelete: (id: string) => void }>({ onDelete: () => {} });

const MediaNode = ({ id, data, isConnectable, selected }: NodeProps) => {
  const { onDelete } = useContext(FunnelContext);
  return (
    <>
      <NodeResizer minWidth={150} minHeight={80} isVisible={selected} lineClassName="border-primary" handleClassName="h-3 w-3 bg-primary border-2 border-background" />
      <div className="relative group w-full h-full min-w-[150px] min-h-[80px] bg-card border-4 border-border rounded-2xl shadow-md overflow-hidden flex flex-col">
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-4 h-4 bg-muted-foreground" />
        <div className={`h-2.5 w-full shrink-0 ${data.color || 'bg-primary'}`} />
        <div className="p-3 flex-1 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
              {data.type === 'text' && <Type className="w-3.5 h-3.5" />}
              {data.type === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
              {data.type === 'video' && <Video className="w-3.5 h-3.5" />}
              {data.type === 'audio' && <Music className="w-3.5 h-3.5" />}
            </div>
            <div className="font-bold text-sm truncate flex-1 leading-tight">{String(data.label || '')}</div>
            <button onClick={() => onDelete(id)} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all z-50 shrink-0" title="Excluir">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <div className="text-xs text-muted-foreground bg-muted/40 px-2 py-1.5 rounded-lg flex-1 overflow-hidden border border-border/50 leading-relaxed whitespace-pre-wrap break-words">
            {String(data.content || '—')}
          </div>
        </div>
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-4 h-4 bg-muted-foreground" />
      </div>
    </>
  );
};

const nodeTypes = { mediaNode: MediaNode };

const initialNodes: Node[] = [
  { id: '1', position: { x: 80, y: 40 }, type: 'mediaNode', data: { label: 'Anúncio Meta Ads', type: 'video', content: 'Vídeo CPL 1 - Focado na dor de falta de tempo do lead comercial.', color: 'bg-blue-500' }, style: { width: 300, height: 140 } },
  { id: '2', position: { x: 80, y: 210 }, type: 'mediaNode', data: { label: 'Landing Page de Cadastro', type: 'text', content: 'Copy focada em conversão e VSL para agendamento automático.', color: 'bg-purple-500' }, style: { width: 300, height: 140 } },
];
const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2', animated: true }];

const mediaTypes = [
  { value: 'text' as const, label: 'Texto', icon: <Type className="w-3.5 h-3.5" />, color: 'bg-primary', activeClass: 'bg-primary/20 text-primary border-primary/40' },
  { value: 'image' as const, label: 'Imagem', icon: <ImageIcon className="w-3.5 h-3.5" />, color: 'bg-emerald-500', activeClass: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40' },
  { value: 'video' as const, label: 'Vídeo', icon: <Video className="w-3.5 h-3.5" />, color: 'bg-red-500', activeClass: 'bg-red-500/20 text-red-600 border-red-500/40' },
  { value: 'audio' as const, label: 'Áudio', icon: <Music className="w-3.5 h-3.5" />, color: 'bg-amber-500', activeClass: 'bg-amber-500/20 text-amber-600 border-amber-500/40' },
];

function SalesFunnelInner() {
  const [nodes, setNodes] = useLocalStorage<Node[]>('nexus-funnel-nodes', initialNodes);
  const [edges, setEdges] = useLocalStorage<Edge[]>('nexus-funnel-edges', initialEdges);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeContent, setNewNodeContent] = useState('');
  const [nodeType, setNodeType] = useState<'text' | 'image' | 'video' | 'audio'>('text');
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

  const addNode = () => {
    if (!newNodeLabel.trim()) return;
    const mt = mediaTypes.find(m => m.value === nodeType)!;
    const newNode: Node = {
      id: Math.random().toString(36).substr(2, 9),
      position: { x: Math.random() * 150 + 30, y: Math.random() * 100 + 30 },
      type: 'mediaNode',
      data: { label: newNodeLabel, content: newNodeContent, type: nodeType, color: mt.color },
      style: { width: 300, height: 140 }
    };
    setNodes((nds) => [...nds, newNode]);
    setNewNodeLabel('');
    setNewNodeContent('');
    setPanelOpen(false);
  };

  const handleDelete = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }, [setNodes, setEdges]);

  const handleReset = () => {
    if (confirm("Tem certeza que deseja apagar todo o funil?")) {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  };

  const handleExport = async () => {
    const container = flowRef.current?.querySelector('.react-flow') as HTMLElement | null;
    if (!container) {
      toast({ title: "Erro", description: "Não foi possível capturar o funil.", variant: "destructive" });
      return;
    }
    setIsExporting(true);
    try {
      const dataUrl = await toPng(container, { backgroundColor: '#0f172a', width: container.offsetWidth, height: container.offsetHeight });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `nexus-funil-${new Date().toISOString().split('T')[0]}.png`;
      a.click();
      toast({ title: "Funil exportado!", description: "A imagem PNG foi baixada com sucesso." });
    } catch {
      toast({ title: "Erro na exportação", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 pb-24 animate-in fade-in duration-500" style={{ height: 'calc(100dvh - 130px)', minHeight: '500px' }}>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 shrink-0">
        <Card className="border-border/50 shadow-sm py-2 px-3 flex items-center justify-between">
          <div><div className="text-[10px] text-muted-foreground">Etapas</div><div className="text-base md:text-2xl font-bold">{nodes.length}</div></div>
          <ListFilter className="text-primary w-4 h-4 opacity-50" />
        </Card>
        <Card className="border-border/50 shadow-sm py-2 px-3 flex items-center justify-between">
          <div><div className="text-[10px] text-muted-foreground">Vídeos</div><div className="text-base md:text-2xl font-bold">{nodes.filter(n => n.data.type === 'video').length}</div></div>
          <Video className="text-red-500 w-4 h-4 opacity-50" />
        </Card>
        <Card className="border-border/50 shadow-sm py-2 px-3 flex items-center justify-between">
          <div><div className="text-[10px] text-muted-foreground">Textos</div><div className="text-base md:text-2xl font-bold">{nodes.filter(n => n.data.type === 'text').length}</div></div>
          <Type className="text-purple-500 w-4 h-4 opacity-50" />
        </Card>
        <Card className="border-border/50 shadow-sm py-2 px-3 flex items-center justify-between bg-primary/5 border-primary/20">
          <div><div className="text-[10px] text-primary font-medium">Conversão Est.</div><div className="text-base md:text-2xl font-bold text-primary">2.4%</div></div>
          <PlayCircle className="text-primary w-4 h-4" />
        </Card>
      </div>

      {/* Title + Actions */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <h2 className="text-lg md:text-2xl font-display font-bold tracking-tight">Funil Visual</h2>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting} className="h-8 px-2 text-xs">
            <Download className="w-3.5 h-3.5" /><span className="hidden sm:inline ml-1">{isExporting ? '...' : 'PNG'}</span>
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
          <CardContent className="p-3 space-y-2">
            <div className="grid grid-cols-4 gap-1.5">
              {mediaTypes.map(t => (
                <button key={t.value} onClick={() => setNodeType(t.value)}
                  className={`py-2 rounded-xl flex flex-col items-center gap-1 text-[10px] font-semibold border transition-all ${nodeType === t.value ? t.activeClass : 'border-border/40 text-muted-foreground bg-muted'}`}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>
            <Input placeholder="Nome da etapa..." value={newNodeLabel} onChange={e => setNewNodeLabel(e.target.value)} className="h-9 text-sm" />
            <div className="flex gap-2">
              <Input placeholder="Conteúdo / copy..." value={newNodeContent} onChange={e => setNewNodeContent(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNode()} className="h-9 text-sm flex-1" />
              <Button size="sm" className="h-9 px-3 shrink-0" onClick={addNode}><Plus className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main content area */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 md:gap-6">

        {/* Desktop sidebar */}
        <Card className="hidden md:flex flex-col w-64 shrink-0 border-border/50 shadow-md overflow-y-auto">
          <CardHeader className="pb-3 p-5 shrink-0">
            <CardTitle className="text-lg">Construtor de Funil</CardTitle>
            <CardDescription className="text-xs">Adicione blocos multimídia ao quadro.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 p-5">
            <div className="space-y-1.5">
              <Label className="text-sm">Tipo de Mídia</Label>
              <div className="grid grid-cols-2 gap-2">
                {mediaTypes.map(t => (
                  <button key={t.value} onClick={() => setNodeType(t.value)}
                    className={`p-2.5 rounded-xl flex flex-col items-center gap-1 text-xs font-semibold border transition-all ${nodeType === t.value ? t.activeClass : 'border-border/40 text-muted-foreground bg-muted hover:bg-muted/80'}`}>
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Nome da Etapa</Label>
              <Input placeholder="Ex: Landing Page" value={newNodeLabel} onChange={e => setNewNodeLabel(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Conteúdo / Copy</Label>
              <Input placeholder="Detalhe o conteúdo..." value={newNodeContent} onChange={e => setNewNodeContent(e.target.value)} className="h-9" onKeyDown={e => e.key === 'Enter' && addNode()} />
            </div>
            <Button className="w-full h-9 shadow-md shadow-primary/20" onClick={addNode}>
              <Plus className="w-4 h-4 mr-2" />Adicionar Bloco
            </Button>
          </CardContent>
        </Card>

        {/* Map — single canvas, fills all remaining space */}
        <Card className="flex-1 min-h-0 border-border/50 shadow-md overflow-hidden rounded-xl md:rounded-2xl">
          <div className="h-full w-full" ref={flowRef}>
            <FunnelContext.Provider value={{ onDelete: handleDelete }}>
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
            </FunnelContext.Provider>
          </div>
        </Card>

      </div>
    </div>
  );
}

export default function SalesFunnel() {
  return (
    <ReactFlowProvider>
      <SalesFunnelInner />
    </ReactFlowProvider>
  );
}
