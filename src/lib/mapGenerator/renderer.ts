import { MapGraph, MapNode, NodeType } from "@/lib/mapGenerator/types";

export class MapRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private graph: MapGraph | null = null;
  private hoveredNode: string | null = null;
  private selectedNode: string | null = null;
  private animationFrame: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  render(
    graph: MapGraph,
    hoveredNode: string | null,
    selectedNode: string | null,
  ): void {
    this.graph = graph;
    this.hoveredNode = hoveredNode;
    this.selectedNode = selectedNode;
    this.draw();
  }

  private draw(): void {
    if (!this.graph) return;

    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    this.drawConnections();

    for (const node of this.graph.nodes.values()) {
      this.drawNode(node);
    }
  }

  private drawConnections(): void {
    if (!this.graph) return;

    const { width, height } = this.canvas;
    const padding = 60;

    for (const node of this.graph.nodes.values()) {
      const startX = padding + node.position.x * (width - 2 * padding);
      const startY = padding + node.position.y * (height - 2 * padding);

      for (const targetId of node.connections) {
        const target = this.graph.nodes.get(targetId);
        if (!target) continue;

        const endX = padding + target.position.x * (width - 2 * padding);
        const endY = padding + target.position.y * (height - 2 * padding);

        this.ctx.strokeStyle = this.isNodeHighlighted(node.id)
          ? "#4A90E2"
          : "#333";
        this.ctx.lineWidth = this.isNodeHighlighted(node.id) ? 3 : 1;

        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);

        const controlY = (startY + endY) / 2;
        this.ctx.bezierCurveTo(startX, controlY, endX, controlY, endX, endY);

        this.ctx.stroke();
      }
    }
  }

  private drawNode(node: MapNode): void {
    const { width, height } = this.canvas;
    const padding = 60;

    const x = padding + node.position.x * (width - 2 * padding);
    const y = padding + node.position.y * (height - 2 * padding);
    const radius = 20;

    this.ctx.fillStyle = this.getNodeColor(node.type);
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = this.isNodeHighlighted(node.id) ? "#4A90E2" : "#000";
    this.ctx.lineWidth = this.isNodeHighlighted(node.id) ? 3 : 2;
    this.ctx.stroke();

    this.ctx.fillStyle = "#fff";
    this.ctx.font = "bold 14px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(this.getNodeIcon(node.type), x, y);

    if (this.hoveredNode === node.id) {
      this.drawTooltip(x, y, node.type);
    }
  }

  private getNodeColor(type: NodeType): string {
    const colors: Record<NodeType, string> = {
      start: "#4CAF50",
      combat: "#F44336",
      elite: "#FF9800",
      rest: "#2196F3",
      shop: "#9C27B0",
      event: "#00BCD4",
      treasure: "#FFC107",
      boss: "#B71C1C",
    };
    return colors[type];
  }

  private getNodeIcon(type: NodeType): string {
    const icons: Record<NodeType, string> = {
      start: "S",
      combat: "⚔",
      elite: "💀",
      rest: "🏕",
      shop: "$",
      event: "?",
      treasure: "💰",
      boss: "👹",
    };
    return icons[type];
  }

  getNodeAt(x: number, y: number): string | null {
    if (!this.graph) return null;

    const { width, height } = this.canvas;
    const padding = 60;
    const radius = 20;

    for (const node of this.graph.nodes.values()) {
      const nodeX = padding + node.position.x * (width - 2 * padding);
      const nodeY = padding + node.position.y * (height - 2 * padding);

      const dist = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      if (dist <= radius) {
        return node.id;
      }
    }

    return null;
  }

  private isNodeHighlighted(nodeId: string): boolean {
    if (this.selectedNode === nodeId) return true;
    if (this.hoveredNode === nodeId) return true;

    if (this.selectedNode && this.graph) {
      const selectedNode = this.graph.nodes.get(this.selectedNode);
      if (selectedNode?.connections.includes(nodeId)) return false;
    }

    return false;
  }

  private drawTooltip(x: number, y: number, type: NodeType): void {
    const text = type.charAt(0).toUpperCase() + type.slice(1);
    const padding = 8;

    this.ctx.font = "14px Arial";
    const metrics = this.ctx.measureText(text);
    const tooltipWidth = metrics.width + padding * 2;
    const tooltipHeight = 24;

    const tooltipX = x - tooltipWidth / 2;
    const tooltipY = y - 35;

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    this.ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

    this.ctx.fillStyle = "#fff";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(text, x, tooltipY + tooltipHeight / 2);
  }

  destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}
