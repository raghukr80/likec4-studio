import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Layers,
  User,
  Box,
  Cpu,
  Server,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
  Code2,
  Eye,
  EyeOff,
  Palette,
  Tag,
  Power,
  FileCode,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Share2,
  Search,
  ArrowRight,
  Grid,
  X,
  Info,
  Sun,
  Moon,
  Sparkles,
  SlidersHorizontal,
  Database,
  Network,
  HardDrive,
  Smartphone,
  Globe,
  Radio,
  Zap,
  Cloud,
  FolderTree,
  Compass,
  ShieldCheck,
  GripVertical,
  CornerDownRight,
  Spline,
  Minus,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  GitCommit,
  Workflow,
  ListOrdered,
  Activity,
  CheckCircle2
} from 'lucide-react';

export const PRESET_SWATCHES = [
  '#236B3B', '#1E653A', '#08427B', '#1168BD', '#2563EB',
  '#0284C7', '#0D9488', '#059669', '#16A34A', '#D97706',
  '#DC2626', '#7C3AED', '#4F46E5', '#334155', '#1E293B', '#0F172A'
];

export const CONNECTOR_TYPES = {
  orthogonal: {
    id: 'orthogonal',
    label: 'Orthogonal',
    icon: CornerDownRight,
    desc: 'Right-angled step routing with rounded corners (Default)'
  },
  curved: {
    id: 'curved',
    label: 'Curved',
    icon: Spline,
    desc: 'Smooth cubic Bézier S-curve routing'
  },
  straight: {
    id: 'straight',
    label: 'Straight',
    icon: Minus,
    desc: 'Direct linear point-to-point connector'
  }
};

export const PORT_POSITIONS = ['auto', 'top', 'right', 'bottom', 'left'];

export function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(30, 41, 59, ${alpha})`;
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  if (c.length === 6) {
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}

export function getPortPosition(elem, handle = 'auto', otherElem = null) {
  const w = elem.width || (elem.isBoundary ? 520 : 228);
  const h = elem.height || (elem.isBoundary ? 360 : 120);
  const x = elem.position?.x || 0;
  const y = elem.position?.y || 0;

  if (handle === 'top') return { x: x + w / 2, y, side: 'top' };
  if (handle === 'bottom') return { x: x + w / 2, y: y + h, side: 'bottom' };
  if (handle === 'left') return { x, y: y + h / 2, side: 'left' };
  if (handle === 'right') return { x: x + w, y: y + h / 2, side: 'right' };

  if (otherElem) {
    const ow = otherElem.width || (otherElem.isBoundary ? 520 : 228);
    const oh = otherElem.height || (otherElem.isBoundary ? 360 : 120);
    const ox = (otherElem.position?.x || 0) + ow / 2;
    const oy = (otherElem.position?.y || 0) + oh / 2;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const dx = ox - cx;
    const dy = oy - cy;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0
        ? { x: x + w, y: cy, side: 'right' }
        : { x, y: cy, side: 'left' };
    } else {
      return dy > 0
        ? { x: cx, y: y + h, side: 'bottom' }
        : { x: cx, y, side: 'top' };
    }
  }

  return { x: x + w / 2, y: y + h / 2, side: 'center' };
}

export function computeConnectorPath(source, target, routing = 'orthogonal') {
  const sx = typeof source === 'object' ? source.x : source;
  const sy = typeof source === 'object' ? source.y : target;
  const tx = typeof target === 'object' ? target.x : arguments[2];
  const ty = typeof target === 'object' ? target.y : arguments[3];
  const routeType = (typeof source === 'object' ? routing : arguments[4]) || 'orthogonal';
  const sSide = source?.side || 'auto';
  const tSide = target?.side || 'auto';

  if (routeType === 'straight') {
    return {
      d: `M ${sx} ${sy} L ${tx} ${ty}`,
      midX: (sx + tx) / 2,
      midY: (sy + ty) / 2
    };
  }

  if (routeType === 'curved') {
    let c1x = sx, c1y = sy, c2x = tx, c2y = ty;
    const dist = Math.hypot(tx - sx, ty - sy) * 0.45;

    if (sSide === 'top') c1y -= dist;
    else if (sSide === 'bottom') c1y += dist;
    else if (sSide === 'left') c1x -= dist;
    else c1x += dist;

    if (tSide === 'top') c2y -= dist;
    else if (tSide === 'bottom') c2y += dist;
    else if (tSide === 'right') c2x += dist;
    else c2x -= dist;

    return {
      d: `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}`,
      midX: (sx + tx) / 2,
      midY: (sy + ty) / 2
    };
  }

  const midX = (sx + tx) / 2;
  const midY = (sy + ty) / 2;
  const radius = 10;

  if (sSide === 'top' || sSide === 'bottom' || tSide === 'top' || tSide === 'bottom') {
    const splitY = (sy + ty) / 2;
    return {
      d: `M ${sx} ${sy} L ${sx} ${splitY} L ${tx} ${splitY} L ${tx} ${ty}`,
      midX,
      midY: splitY
    };
  }

  const rX = Math.min(radius, Math.abs(midX - sx));
  const rY = Math.min(radius, Math.abs(ty - sy) / 2);
  const r = Math.min(rX, rY);

  if (r < 2 || Math.abs(ty - sy) < 4) {
    return {
      d: `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${ty} L ${tx} ${ty}`,
      midX,
      midY
    };
  }

  const dirX = midX > sx ? 1 : -1;
  const dirY = ty > sy ? 1 : -1;

  const p1x = midX - dirX * r;
  const p1y = sy;
  const c1x = midX;
  const c1y = sy + dirY * r;

  const p2x = midX;
  const p2y = ty - dirY * r;
  const c2x = midX + dirX * r;
  const c2y = ty;

  return {
    d: `M ${sx} ${sy} L ${p1x} ${p1y} Q ${midX} ${sy} ${c1x} ${c1y} L ${p2x} ${p2y} Q ${midX} ${ty} ${c2x} ${c2y} L ${tx} ${ty}`,
    midX,
    midY
  };
}

export const LIKEC4_BUNDLED_ICONS = {
  'tech:react': {
    id: 'tech:react',
    label: 'React',
    category: 'Frontend',
    defaultTech: 'React 19 / TypeScript',
    render: (cls = 'w-4 h-4') => (
      <svg className={cls} viewBox="-11.5 -10.23174 23 20.46348" fill="none">
        <circle cx="0" cy="0" r="2.2" fill="#00D8FF"/>
        <g stroke="#00D8FF" strokeWidth="1.2" fill="none">
          <ellipse rx="11" ry="4.2"/>
          <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
          <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
        </g>
      </svg>
    )
  },
  'tech:typescript': {
    id: 'tech:typescript',
    label: 'TypeScript',
    category: 'Languages',
    defaultTech: 'TypeScript 5.x',
    render: (cls = 'w-4 h-4') => (
      <svg className={cls} viewBox="0 0 32 32">
        <rect width="32" height="32" rx="4" fill="#3178C6"/>
        <path d="M19.5 21.5c.8.5 1.8.8 2.8.8 1.5 0 2.4-.7 2.4-1.8 0-1.1-.9-1.6-2.5-2.2-2.3-.9-3.5-2-3.5-3.8 0-2.3 1.8-3.9 4.6-3.9 1.2 0 2.2.3 2.9.7l-.7 2.1c-.6-.4-1.4-.6-2.2-.6-1.3 0-2.1.6-2.1 1.5 0 .9.8 1.4 2.4 2 2.4.9 3.6 2.1 3.6 4 0 2.4-1.8 4.1-4.8 4.1-1.4 0-2.6-.4-3.4-.9l.7-2zm-7.6-8.3h-4.3v-2.4h11.2v2.4h-4.4v11h-2.5v-11z" fill="#FFF"/>
      </svg>
    )
  },
  'tech:nodejs': {
    id: 'tech:nodejs',
    label: 'Node.js',
    category: 'Backend',
    defaultTech: 'Node.js LTS / Express',
    render: (cls = 'w-4 h-4') => (
      <svg className={cls} viewBox="0 0 32 32" fill="none">
        <path d="M16 3l11.25 6.5v13L16 29 4.75 22.5V9.5L16 3z" fill="#5FA04E"/>
        <path d="M16 11.5c-2.4 0-4 1.2-4 3 0 2.2 2.5 2.5 4.5 2.8 1.5.2 2.2.6 2.2 1.3 0 .8-.8 1.4-2.1 1.4-1.5 0-2.6-.5-3.3-1.1l-.8 1.8c.9.7 2.4 1.2 4.1 1.2 2.7 0 4.2-1.3 4.2-3.3 0-2.3-2.6-2.6-4.6-2.9-1.4-.2-2.1-.5-2.1-1.2 0-.7.7-1.2 1.9-1.2 1.2 0 2.2.4 2.8.8l.8-1.7c-.8-.5-2-1-3.6-1z" fill="#FFF"/>
      </svg>
    )
  },
  'tech:golang': {
    id: 'tech:golang',
    label: 'Go / Golang',
    category: 'Backend',
    defaultTech: 'Go 1.24 / Gin',
    render: (cls = 'w-4 h-4') => (
      <svg className={cls} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="4" fill="#00ADD8"/>
        <text x="16" y="21" fill="#FFF" fontSize="13" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">GO</text>
      </svg>
    )
  },
  'tech:postgresql': {
    id: 'tech:postgresql',
    label: 'PostgreSQL',
    category: 'Data & Storage',
    defaultTech: 'PostgreSQL 17 Cluster',
    render: (cls = 'w-4 h-4') => (
      <svg className={cls} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="4" fill="#336791"/>
        <ellipse cx="16" cy="11" rx="9" ry="4" fill="#FFF" fillOpacity="0.9"/>
        <path d="M7 11v8c0 2.2 4 4 9 4s9-1.8 9-4v-8" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/>
        <path d="M7 15c0 2.2 4 4 9 4s9-1.8 9-4" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
  },
  'tech:redis': {
    id: 'tech:redis',
    label: 'Redis Cache',
    category: 'Data & Storage',
    defaultTech: 'Redis 7.4 / Sentinel',
    render: (cls = 'w-4 h-4') => (
      <svg className={cls} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="4" fill="#D82C20"/>
        <path d="M6 13l10-4 10 4-10 4-10-4z" fill="#FFF"/>
        <path d="M6 17l10 4 10-4-10-4-10 4z" fill="#FFF" fillOpacity="0.8"/>
        <path d="M6 21l10 4 10-4-10-4-10 4z" fill="#FFF" fillOpacity="0.6"/>
      </svg>
    )
  },
  'tech:kafka': {
    id: 'tech:kafka',
    label: 'Apache Kafka',
    category: 'Messaging',
    defaultTech: 'Apache Kafka 3.9',
    render: (cls = 'w-4 h-4') => (
      <svg className={cls} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="4" fill="#231F20"/>
        <circle cx="10" cy="16" r="3.5" fill="#FFF"/>
        <circle cx="22" cy="10" r="3" fill="#FFF"/>
        <circle cx="22" cy="22" r="3" fill="#FFF"/>
        <path d="M10 16l12-6M10 16l12 6" stroke="#FFF" strokeWidth="2.2"/>
      </svg>
    )
  },
  'tech:kubernetes': {
    id: 'tech:kubernetes',
    label: 'Kubernetes',
    category: 'Cloud & Infra',
    defaultTech: 'Kubernetes Cluster',
    render: (cls = 'w-4 h-4') => (
      <svg className={cls} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="4" fill="#326CE5"/>
        <circle cx="16" cy="16" r="8" stroke="#FFF" strokeWidth="2.5" fill="none"/>
        <circle cx="16" cy="16" r="3" fill="#FFF"/>
        <path d="M16 6v4M16 22v4M6 16h4M22 16h4" stroke="#FFF" strokeWidth="2"/>
      </svg>
    )
  },
  'tech:aws': {
    id: 'tech:aws',
    label: 'AWS Cloud',
    category: 'Cloud & Infra',
    defaultTech: 'AWS Cloud Services',
    render: (cls = 'w-4 h-4') => (
      <svg className={cls} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="4" fill="#232F3E"/>
        <text x="16" y="16" fill="#FFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">AWS</text>
        <path d="M9 20c4 3 10 3 14 0" stroke="#FF9900" strokeWidth="2" strokeLinecap="round"/>
        <path d="M22 19l2 1.5-1.5 1.5" fill="#FF9900"/>
      </svg>
    )
  },
  'tech:nginx': {
    id: 'tech:nginx',
    label: 'NGINX Reverse Proxy',
    category: 'Routing',
    defaultTech: 'NGINX / TLS 1.3',
    render: (cls = 'w-4 h-4') => (
      <svg className={cls} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="4" fill="#009639"/>
        <text x="16" y="21" fill="#FFF" fontSize="11" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">N</text>
      </svg>
    )
  },
  'tech:envoy': {
    id: 'tech:envoy',
    label: 'Envoy Gateway',
    category: 'Routing',
    defaultTech: 'Envoy Proxy / gRPC',
    render: (cls = 'w-4 h-4') => (
      <svg className={cls} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="4" fill="#9259a3"/>
        <path d="M16 6l9 5v10l-9 5-9-5V11l9-5z" stroke="#FFF" strokeWidth="2" fill="none"/>
        <circle cx="16" cy="16" r="3" fill="#FFF"/>
      </svg>
    )
  },
  'tech:user': {
    id: 'tech:user',
    label: 'Customer / Actor',
    category: 'Actors',
    defaultTech: 'Client / Operator Role',
    render: (cls = 'w-4 h-4') => (
      <svg className={cls} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="4" fill="#08427B"/>
        <circle cx="16" cy="12" r="5" fill="#FFF"/>
        <path d="M7 25c0-4.5 4-8 9-8s9 3.5 9 8" fill="#FFF"/>
      </svg>
    )
  }
};

export function LikeC4Icon({ iconId, fallbackIcon: FallbackIcon, className = 'w-4 h-4' }) {
  if (iconId && LIKEC4_BUNDLED_ICONS[iconId]) {
    return LIKEC4_BUNDLED_ICONS[iconId].render(className);
  }
  if (FallbackIcon) {
    return <FallbackIcon className={className} />;
  }
  return <Layers className={className} />;
}

const ELEMENT_ARCHETYPES = {
  systemBoundary: {
    category: 'Boundaries & Enclosures',
    label: 'System Boundary',
    c4Type: 'softwareSystem',
    isBoundary: true,
    icon: Layers,
    defaultIconId: 'tech:aws',
    color: '#0284C7',
    border: '#0369A1',
    textColor: '#FFFFFF',
    defaultTech: 'System Perimeter',
    desc: 'Logical boundary enclosing related containers and microservices'
  },
  cloudVpc: {
    category: 'Boundaries & Enclosures',
    label: 'Cloud VPC / Region',
    c4Type: 'deploymentNode',
    isBoundary: true,
    icon: Cloud,
    defaultIconId: 'tech:aws',
    color: '#334155',
    border: '#475569',
    textColor: '#FFFFFF',
    defaultTech: 'AWS VPC (10.0.0.0/16)',
    desc: 'Isolated cloud virtual network and security zone'
  },
  k8sNamespace: {
    category: 'Boundaries & Enclosures',
    label: 'Kubernetes Cluster',
    c4Type: 'deploymentNode',
    isBoundary: true,
    icon: Cloud,
    defaultIconId: 'tech:kubernetes',
    color: '#2563EB',
    border: '#3B82F6',
    textColor: '#FFFFFF',
    defaultTech: 'EKS / K8s prod-namespace',
    desc: 'Container orchestrator boundary grouping pods and nodes'
  },
  person: {
    category: 'Actors & Systems',
    label: 'Person / Actor',
    c4Type: 'person',
    icon: User,
    defaultIconId: 'tech:user',
    color: '#08427B',
    border: '#052E56',
    textColor: '#FFFFFF',
    defaultTech: 'User / Role',
    desc: 'Customer, business user, or operator'
  },
  softwareSystem: {
    category: 'Actors & Systems',
    label: 'Software System',
    c4Type: 'softwareSystem',
    icon: Layers,
    defaultIconId: 'tech:aws',
    color: '#1168BD',
    border: '#0B4884',
    textColor: '#FFFFFF',
    defaultTech: 'System Platform',
    desc: 'Top-level business or enterprise software'
  },
  webApp: {
    category: 'Clients & Apps',
    label: 'Web SPA / Frontend',
    c4Type: 'container',
    icon: Globe,
    defaultIconId: 'tech:react',
    color: '#2563EB',
    border: '#1D4ED8',
    textColor: '#FFFFFF',
    defaultTech: 'React / Next.js / TypeScript',
    desc: 'Single-page browser application'
  },
  loadBalancer: {
    category: 'Compute & Routing',
    label: 'Load Balancer',
    c4Type: 'container',
    icon: Network,
    defaultIconId: 'tech:nginx',
    color: '#4F46E5',
    border: '#4338CA',
    textColor: '#FFFFFF',
    defaultTech: 'NGINX / AWS ALB',
    desc: 'High-availability traffic distributor'
  },
  apiGateway: {
    category: 'Compute & Routing',
    label: 'API Gateway',
    c4Type: 'container',
    icon: ShieldCheck,
    defaultIconId: 'tech:envoy',
    color: '#7C3AED',
    border: '#6D28D9',
    textColor: '#FFFFFF',
    defaultTech: 'Envoy / Kong / REST',
    desc: 'Edge routing, rate limiting & auth'
  },
  webServer: {
    category: 'Compute & Routing',
    label: 'Microservice / Server',
    c4Type: 'container',
    icon: Server,
    defaultIconId: 'tech:nodejs',
    color: '#0D9488',
    border: '#0F766E',
    textColor: '#FFFFFF',
    defaultTech: 'Node.js / Go / Microservice',
    desc: 'Backend service handling business domain logic'
  },
  database: {
    category: 'Data & Queues',
    label: 'Relational Database',
    c4Type: 'container',
    icon: Database,
    defaultIconId: 'tech:postgresql',
    color: '#059669',
    border: '#047857',
    textColor: '#FFFFFF',
    defaultTech: 'PostgreSQL 17 HA Cluster',
    desc: 'ACID transaction store and relational schemas'
  }
};

const INITIAL_MODEL = {
  elements: {
    vpc_boundary: {
      id: 'vpc_boundary',
      archetypeKey: 'cloudVpc',
      isBoundary: true,
      enabled: true,
      type: 'deploymentNode',
      name: 'AWS Cloud Production VPC',
      title: 'Region us-east-1 (VPC 10.0.0.0/16)',
      description: 'Production infrastructure boundary enclosing digital services.',
      technology: 'AWS VPC / Terraform',
      iconId: 'tech:aws',
      tags: ['cloud', 'vpc', 'boundary'],
      position: { x: 40, y: 40 },
      width: 980,
      height: 520,
      boundaryStyle: {
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#0284C7',
        fillColor: '#0369A1',
        fillOpacity: 0.08
      }
    },
    customer: {
      id: 'customer',
      archetypeKey: 'person',
      type: 'person',
      enabled: true,
      name: 'Retail Customer',
      title: 'Banking Client',
      description: 'Customer accessing web and mobile banking services.',
      technology: 'Web / Mobile User',
      iconId: 'tech:user',
      tags: ['actor', 'external'],
      position: { x: 80, y: 90 },
      width: 210,
      height: 128
    },
    banking_system: {
      id: 'banking_system',
      parentId: 'vpc_boundary',
      archetypeKey: 'systemBoundary',
      isBoundary: true,
      enabled: true,
      type: 'softwareSystem',
      name: 'Internet Banking Core',
      title: 'Internal Banking Mesh',
      description: 'Core microservices subsystem responsible for customer transactions.',
      technology: 'Cloud Microservices',
      iconId: 'tech:aws',
      tags: ['core', 'financial'],
      opacity: 1,
      displayOptions: {
        showTitle: true,
        showDescription: true,
        showTechnology: true,
        showTags: true,
        showIcon: true,
        showType: true
      },
      position: { x: 320, y: 90 },
      width: 660,
      height: 440,
      boundaryStyle: {
        borderStyle: 'solid',
        borderWidth: 2,
        borderColor: '#3B82F6',
        fillColor: '#1E293B',
        fillOpacity: 0.12
      }
    },
    load_balancer: {
      id: 'load_balancer',
      parentId: 'banking_system',
      archetypeKey: 'loadBalancer',
      type: 'container',
      enabled: true,
      name: 'Edge Load Balancer',
      title: 'Traffic Ingress',
      description: 'Distributes web and API traffic across redundant edge gateways.',
      technology: 'NGINX / TLS 1.3',
      iconId: 'tech:nginx',
      tags: ['network', 'ingress'],
      opacity: 1,
      displayOptions: {
        showTitle: true,
        showDescription: true,
        showTechnology: true,
        showTags: true,
        showIcon: true,
        showType: true
      },
      position: { x: 350, y: 150 },
      width: 228,
      height: 128
    },
    spa: {
      id: 'spa',
      parentId: 'banking_system',
      archetypeKey: 'webApp',
      type: 'container',
      enabled: true,
      name: 'Web Banking Client',
      title: 'Single-Page Application',
      description: 'Delivers web-based banking UI directly inside customer browsers.',
      technology: 'React 19, TypeScript',
      iconId: 'tech:react',
      tags: ['frontend'],
      position: { x: 620, y: 150 },
      width: 228,
      height: 128
    },
    api_gateway: {
      id: 'api_gateway',
      parentId: 'banking_system',
      archetypeKey: 'apiGateway',
      type: 'container',
      enabled: true,
      name: 'API Gateway Service',
      title: 'Public REST Edge',
      description: 'Authenticates requests and routes calls to banking microservices.',
      technology: 'Envoy, Go, OAuth2',
      iconId: 'tech:envoy',
      tags: ['backend', 'gateway'],
      position: { x: 350, y: 310 },
      width: 228,
      height: 128
    },
    db_container: {
      id: 'db_container',
      parentId: 'banking_system',
      archetypeKey: 'database',
      type: 'container',
      enabled: true,
      name: 'Banking Relational DB',
      title: 'Customer Data Store',
      description: 'Stores user accounts, credentials, logs, and scheduled transactions.',
      technology: 'PostgreSQL 17 HA Cluster',
      iconId: 'tech:postgresql',
      tags: ['database'],
      position: { x: 620, y: 310 },
      width: 228,
      height: 128
    }
  },
  relationships: {
    rel_1: {
      id: 'rel_1',
      sourceId: 'customer',
      targetId: 'load_balancer',
      sourceHandle: 'right',
      targetHandle: 'left',
      title: 'Visits web application',
      technology: 'HTTPS/TLS',
      routing: 'orthogonal'
    },
    rel_2: {
      id: 'rel_2',
      sourceId: 'load_balancer',
      targetId: 'spa',
      sourceHandle: 'right',
      targetHandle: 'left',
      title: 'Serves static assets',
      technology: 'HTTPS',
      routing: 'orthogonal'
    },
    rel_3: {
      id: 'rel_3',
      sourceId: 'spa',
      targetId: 'api_gateway',
      sourceHandle: 'bottom',
      targetHandle: 'right',
      title: 'Sends authenticated REST calls',
      technology: 'JSON / HTTPS',
      routing: 'orthogonal'
    },
    rel_4: {
      id: 'rel_4',
      sourceId: 'api_gateway',
      targetId: 'db_container',
      sourceHandle: 'right',
      targetHandle: 'left',
      title: 'Reads and writes transactions',
      technology: 'TCP / SSL',
      routing: 'orthogonal'
    }
  },
  views: {
    context: {
      id: 'context',
      kind: 'context',
      title: 'System Context Overview',
      description: 'High-level context showing users, core platform, and external boundaries.',
      scope: 'banking_system'
    },
    landscape: {
      id: 'landscape',
      kind: 'landscape',
      title: 'System Landscape Overview',
      description: 'High-level context showing enterprise boundaries and actors.',
      scope: ''
    },
    banking_containers: {
      id: 'banking_containers',
      kind: 'container',
      title: 'Banking Containers Architecture',
      description: 'Internal components, web applications and microservices.',
      scope: 'banking_system'
    },
    login_dynamic_flow: {
      id: 'login_dynamic_flow',
      kind: 'dynamic',
      title: 'User Authentication Flow',
      description: 'Step-by-step authentication sequence verifying client credentials.',
      scope: 'banking_system',
      steps: [
        {
          id: 'step_1',
          sourceId: 'customer',
          targetId: 'load_balancer',
          title: 'Submits login credentials',
          technology: 'HTTPS / TLS 1.3'
        },
        {
          id: 'step_2',
          sourceId: 'load_balancer',
          targetId: 'spa',
          title: 'Delivers single-page app and auth challenge',
          technology: 'HTTP 200'
        },
        {
          id: 'step_3',
          sourceId: 'spa',
          targetId: 'api_gateway',
          title: 'POST /v1/auth/tokens with JWT grant',
          technology: 'JSON / HTTPS'
        },
        {
          id: 'step_4',
          sourceId: 'api_gateway',
          targetId: 'db_container',
          title: 'Validates credential hash & checks active sessions',
          technology: 'SQL Connection Pool'
        }
      ]
    },
    funds_transfer_usecase: {
      id: 'funds_transfer_usecase',
      kind: 'usecase',
      title: 'UC-04: Instant Wire Transfer',
      description: 'Customer completes two-factor payment authorization and ledger debit.',
      scope: 'banking_system',
      steps: [
        {
          id: 'uc_1',
          sourceId: 'customer',
          targetId: 'spa',
          title: 'Initiates transfer of $500 to recipient',
          technology: 'UI Interaction'
        },
        {
          id: 'uc_2',
          sourceId: 'spa',
          targetId: 'api_gateway',
          title: 'Dispatches signed transfer mutation with 2FA token',
          technology: 'gRPC / TLS'
        },
        {
          id: 'uc_3',
          sourceId: 'api_gateway',
          targetId: 'db_container',
          title: 'Executes atomic ACID transaction debiting sender account',
          technology: 'PostgreSQL Read/Write'
        }
      ]
    }
  }
};

const Serializers = {
  toLikeC4(model) {
    const lines = [];
    lines.push('specification {');
    lines.push('  element person');
    lines.push('  element softwareSystem');
    lines.push('  element container');
    lines.push('  element component');
    lines.push('  element deploymentNode');
    lines.push('  tag actor');
    lines.push('  tag boundary');
    lines.push('  tag dynamic');
    lines.push('  tag usecase');
    lines.push('}');
    lines.push('');
    lines.push('model {');

    const rootElements = Object.values(model.elements).filter((e) => !e.parentId);

    const renderNode = (elem, indent) => {
      const sanitizedId = elem.id.replace(/[^a-zA-Z0-9_]/g, '_');
      const children = Object.values(model.elements).filter((e) => e.parentId === elem.id);
      const isMuted = elem.enabled === false;
      const prefix = isMuted ? `${indent}// [DISABLED] ` : indent;

      const hasDetails = children.length > 0 || elem.title || elem.description || elem.technology || elem.iconId || isMuted;

      if (!hasDetails) {
        lines.push(`${prefix}${sanitizedId} = ${elem.type} '${elem.name}';`);
        return;
      }

      lines.push(`${prefix}${sanitizedId} = ${elem.type} '${elem.name}' {`);
      if (elem.title) lines.push(`${indent}  title '${elem.title}';`);
      if (elem.description) lines.push(`${indent}  description '${elem.description}';`);
      if (elem.technology) lines.push(`${indent}  technology '${elem.technology}';`);
      if (elem.iconId) lines.push(`${indent}  icon ${elem.iconId};`);
      
      const allTags = [...(elem.tags || [])];
      if (isMuted) allTags.push('disabled');
      if (allTags.length > 0) {
        lines.push(`${indent}  #${allTags.join(', #')};`);
      }

      for (const child of children) {
        renderNode(child, `${indent}  `);
      }
      lines.push(`${indent}}`);
    };

    for (const root of rootElements) {
      renderNode(root, '  ');
    }

    lines.push('');
    lines.push('  // Static Architecture Relationships');
    for (const rel of Object.values(model.relationships)) {
      const src = model.elements[rel.sourceId];
      const tgt = model.elements[rel.targetId];
      const isRelMuted = src?.enabled === false || tgt?.enabled === false;
      const prefix = isRelMuted ? '  // [DISABLED_REL] ' : '  ';

      const s = rel.sourceId.replace(/[^a-zA-Z0-9_]/g, '_');
      const t = rel.targetId.replace(/[^a-zA-Z0-9_]/g, '_');
      const desc = rel.title ? ` '${rel.title}'` : '';
      const tech = rel.technology ? ` [${rel.technology}]` : '';
      lines.push(`${prefix}${s} -> ${t}${desc}${tech};`);
    }

    lines.push('}');
    lines.push('');
    lines.push('views {');

    for (const view of Object.values(model.views || {})) {
      if (view.kind === 'dynamic' || view.kind === 'usecase') {
        lines.push(`  dynamic view ${view.id} {`);
        if (view.title) lines.push(`    title '${view.title}';`);
        if (view.description) lines.push(`    description '${view.description}';`);
        lines.push('');
        lines.push('    // Sequential Dynamic Flow Steps');
        (view.steps || []).forEach((step, idx) => {
          const s = step.sourceId.replace(/[^a-zA-Z0-9_]/g, '_');
          const t = step.targetId.replace(/[^a-zA-Z0-9_]/g, '_');
          const desc = step.title ? ` '${step.title}'` : '';
          const tech = step.technology ? ` [${step.technology}]` : '';
          lines.push(`    ${s} -> ${t}${desc}${tech};`);
        });
        lines.push('  }');
        lines.push('');
      } else {
        const scopeClause = view.scope ? ` of ${view.scope}` : '';
        lines.push(`  view ${view.id}${scopeClause} {`);
        if (view.title) lines.push(`    title '${view.title}';`);
        if (view.description) lines.push(`    description '${view.description}';`);
        lines.push('    include *;');
        lines.push('  }');
        lines.push('');
      }
    }

    lines.push('}');
    return lines.join('\n');
  },

  toMermaid(model, activeViewId) {
    const activeView = model.views[activeViewId];
    if (activeView && (activeView.kind === 'dynamic' || activeView.kind === 'usecase')) {
      const lines = ['sequenceDiagram', `    autonumber`, `    title ${activeView.title}`];
      (activeView.steps || []).forEach((step) => {
        const s = model.elements[step.sourceId]?.name || step.sourceId;
        const t = model.elements[step.targetId]?.name || step.targetId;
        const msg = `${step.title || 'interacts'} ${step.technology ? `(${step.technology})` : ''}`.trim();
        lines.push(`    ${s}->>${t}: ${msg}`);
      });
      return lines.join('\n');
    }

    const lines = ['C4Container', '    title System Architecture Diagram'];
    for (const elem of Object.values(model.elements)) {
      const id = elem.id.replace(/[^a-zA-Z0-9_]/g, '_');
      const name = elem.name.replace(/"/g, "'");
      const desc = (elem.description || '').replace(/"/g, "'");
      const tech = (elem.technology || '').replace(/"/g, "'");

      if (elem.type === 'person') {
        lines.push(`    Person(${id}, "${name}", "${desc}")`);
      } else if (elem.type === 'softwareSystem') {
        lines.push(`    System(${id}, "${name}", "${desc}")`);
      } else {
        lines.push(`    Container(${id}, "${name}", "${tech}", "${desc}")`);
      }
    }
    for (const rel of Object.values(model.relationships)) {
      const s = rel.sourceId.replace(/[^a-zA-Z0-9_]/g, '_');
      const t = rel.targetId.replace(/[^a-zA-Z0-9_]/g, '_');
      lines.push(`    Rel(${s}, ${t}, "${(rel.title || '').replace(/"/g, "'")}", "${(rel.technology || '').replace(/"/g, "'")}")`);
    }
    return lines.join('\n');
  },

  toDrawio(model) {
    const escapeXml = (str) =>
      (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const cells = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>'];

    for (const elem of Object.values(model.elements)) {
      const pos = elem.position || { x: 100, y: 100 };
      const width = elem.width || 220;
      const height = elem.height || 120;
      const arch = ELEMENT_ARCHETYPES[elem.archetypeKey] || ELEMENT_ARCHETYPES.softwareSystem;
      const style = `rounded=1;whiteSpace=wrap;html=1;fillColor=${arch.color};strokeColor=${arch.border};fontColor=${arch.textColor};`;
      const label = `&lt;b&gt;${escapeXml(elem.name)}&lt;/b&gt;&lt;br/&gt;${escapeXml(elem.description)}`;

      cells.push(`
        <mxCell id="${elem.id}" value="${label}" style="${style}" vertex="1" parent="1">
          <mxGeometry x="${pos.x}" y="${pos.y}" width="${width}" height="${height}" as="geometry"/>
        </mxCell>
      `);
    }

    for (const rel of Object.values(model.relationships)) {
      const label = escapeXml(rel.title);
      cells.push(`
        <mxCell id="${rel.id}" value="${label}" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#334155;strokeWidth=2;endArrow=block;" edge="1" parent="1" source="${rel.sourceId}" target="${rel.targetId}">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
      `);
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="LikeC4Studio" version="2.8">
  <diagram id="likec4" name="Architecture">
    <mxGraphModel dx="1200" dy="800" grid="1" guides="1" tooltips="1" connect="1" arrows="1">
      <root>${cells.join('\n')}</root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
  },

  toSvg(model, isDark = true, width = 1600, height = 1000) {
    const bgColor = isDark ? '#090D16' : '#F8FAFC';
    const edgeColor = isDark ? '#38BDF8' : '#0284C7';
    const lines = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: ${bgColor}; font-family: system-ui, sans-serif;">`,
      `<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 1 L 10 5 L 0 9 z" fill="${edgeColor}" /></marker></defs>`
    ];

    for (const elem of Object.values(model.elements).filter((e) => e.isBoundary)) {
      const x = elem.position?.x || 50;
      const y = elem.position?.y || 50;
      const w = elem.width || 450;
      const h = elem.height || 300;
      const bStyle = elem.boundaryStyle || {};
      lines.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${bStyle.fillColor || '#1E293B'}" fill-opacity="${bStyle.fillOpacity ?? 0.1}" stroke="${bStyle.borderColor || '#3B82F6'}" stroke-width="${bStyle.borderWidth || 2}" stroke-dasharray="6,4" />`);
      lines.push(`<text x="${x + 14}" y="${y + 22}" fill="${bStyle.borderColor || '#3B82F6'}" font-size="12" font-weight="bold">${elem.name}</text>`);
    }

    for (const rel of Object.values(model.relationships)) {
      const src = model.elements[rel.sourceId];
      const dst = model.elements[rel.targetId];
      if (!src || !dst) continue;
      const srcPort = getPortPosition(src, rel.sourceHandle || 'auto', dst);
      const dstPort = getPortPosition(dst, rel.targetHandle || 'auto', src);
      const pathInfo = computeConnectorPath(srcPort, dstPort, rel.routing || 'orthogonal');
      lines.push(`<path d="${pathInfo.d}" fill="none" stroke="${edgeColor}" stroke-width="2.5" stroke-dasharray="6,4" marker-end="url(#arrow)" />`);
      if (rel.title) {
        lines.push(`<text x="${pathInfo.midX}" y="${pathInfo.midY - 4}" fill="${isDark ? '#F1F5F9' : '#0F172A'}" font-size="11" text-anchor="middle">${rel.title}</text>`);
      }
    }

    for (const elem of Object.values(model.elements).filter((e) => !e.isBoundary)) {
      const arch = ELEMENT_ARCHETYPES[elem.archetypeKey] || ELEMENT_ARCHETYPES.softwareSystem;
      const x = elem.position?.x || 100;
      const y = elem.position?.y || 100;
      const w = elem.width || 220;
      const h = elem.height || 110;
      lines.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${arch.color}" stroke="${arch.border}" stroke-width="2"/>`);
      lines.push(`<text x="${x + 14}" y="${y + 24}" fill="${arch.textColor}" font-size="9" font-family="monospace" opacity="0.85">${(arch.label || '').toUpperCase()}</text>`);
      lines.push(`<text x="${x + 14}" y="${y + 44}" fill="${arch.textColor}" font-size="12" font-weight="bold">${elem.name}</text>`);
      lines.push(`<text x="${x + 14}" y="${y + 64}" fill="${arch.textColor}" font-size="9" opacity="0.85">${(elem.description || '').substring(0, 36)}</text>`);
      if (elem.technology) {
        lines.push(`<text x="${x + 14}" y="${y + 82}" fill="${arch.textColor}" font-size="8" font-family="monospace" opacity="0.75">[${elem.technology}]</text>`);
      }
    }

    lines.push('</svg>');
    return lines.join('\n');
  }
};

export default function App() {
  const [model, setModel] = useState(INITIAL_MODEL);
  const [theme, setTheme] = useState('light');
  const [archetypes, setArchetypes] = useState(ELEMENT_ARCHETYPES);
  const [showAddArchetypeModal, setShowAddArchetypeModal] = useState(false);
  const [newArchetypeForm, setNewArchetypeForm] = useState({
    label: '',
    category: 'Compute & Routing',
    customCategory: '',
    c4Type: 'container',
    isBoundary: false,
    defaultTech: '',
    desc: '',
    iconId: 'tech:nodejs',
    color: '#0D9488',
    border: '#0F766E',
    textColor: '#FFFFFF'
  });
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [selectedRelId, setSelectedRelId] = useState(null);
  const [activeViewMode, setActiveViewMode] = useState('canvas');
  const [currentLayerFilter, setCurrentLayerFilter] = useState('all');

  const [defaultConnectorType, setDefaultConnectorType] = useState('orthogonal');
  const [leftTab, setLeftTab] = useState('model');
  const [activeLikeC4ViewId, setActiveLikeC4ViewId] = useState('context');

  /* Dynamic Flow & Use Case State */
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlayingFlow, setIsPlayingFlow] = useState(false);
  const [dynamicPresentationMode, setDynamicPresentationMode] = useState('diagram');
  const flowPlaybackTimer = useRef(null);

  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const isResizingLeft = useRef(false);
  const isResizingRight = useRef(false);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 30, y: 30 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragBoundaryChildrenInitialPos = useRef({});
  const dragBoundaryInitialPos = useRef({ x: 0, y: 0 });

  const [resizingNodeId, setResizingNodeId] = useState(null);
  const resizeStartRef = useRef({ mouseX: 0, mouseY: 0, width: 0, height: 0 });

  const [connectionStart, setConnectionStart] = useState(null);
  const [connectingSourceId, setConnectingSourceId] = useState(null);

  const [showExportModal, setShowExportModal] = useState(false);
  const [showCreateViewModal, setShowCreateViewModal] = useState(false);
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('likec4');
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showGrid, setShowGrid] = useState(true);

  const [newViewForm, setNewViewForm] = useState({
    id: '',
    title: '',
    kind: 'dynamic',
    description: '',
    scope: ''
  });

  const [newStepForm, setNewStepForm] = useState({
    sourceId: 'customer',
    targetId: 'load_balancer',
    title: '',
    technology: 'HTTPS'
  });

  const canvasRef = useRef(null);
  const isDark = theme === 'dark';

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  }, []);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} theme`);
  };

  useEffect(() => {
    const handleMouseMoveWindow = (e) => {
      if (isResizingLeft.current) {
        const newWidth = Math.max(260, Math.min(e.clientX, 540));
        setLeftPanelWidth(newWidth);
      } else if (isResizingRight.current) {
        const newWidth = Math.max(260, Math.min(window.innerWidth - e.clientX, 600));
        setRightPanelWidth(newWidth);
      }
    };

    const handleMouseUpWindow = () => {
      isResizingLeft.current = false;
      isResizingRight.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    window.addEventListener('mousemove', handleMouseMoveWindow);
    window.addEventListener('mouseup', handleMouseUpWindow);
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveWindow);
      window.removeEventListener('mouseup', handleMouseUpWindow);
    };
  }, []);

  const startResizeLeft = (e) => {
    e.preventDefault();
    isResizingLeft.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const startResizeRight = (e) => {
    e.preventDefault();
    isResizingRight.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const activeView = model.views[activeLikeC4ViewId];
  const isDynamicOrUseCase = activeView?.kind === 'dynamic' || activeView?.kind === 'usecase';
  const dynamicSteps = activeView?.steps || [];

  const sequenceParticipants = useMemo(() => {
    if (!isDynamicOrUseCase) return [];
    const pSet = new Set();
    dynamicSteps.forEach((st) => {
      if (st.sourceId) pSet.add(st.sourceId);
      if (st.targetId) pSet.add(st.targetId);
    });
    return Array.from(pSet)
      .map((id) => model.elements[id])
      .filter(Boolean);
  }, [isDynamicOrUseCase, dynamicSteps, model.elements]);

  useEffect(() => {
    if (isPlayingFlow && isDynamicOrUseCase && dynamicSteps.length > 0) {
      flowPlaybackTimer.current = setInterval(() => {
        setActiveStepIndex((prev) => (prev + 1) % dynamicSteps.length);
      }, 2500);
    } else {
      if (flowPlaybackTimer.current) clearInterval(flowPlaybackTimer.current);
    }
    return () => {
      if (flowPlaybackTimer.current) clearInterval(flowPlaybackTimer.current);
    };
  }, [isPlayingFlow, isDynamicOrUseCase, dynamicSteps.length]);

  const currentStep = isDynamicOrUseCase && dynamicSteps.length > 0 ? dynamicSteps[activeStepIndex] : null;

  const updateSelectedElement = useCallback((updates) => {
    if (!selectedElementId) return;
    setModel((prev) => {
      const elem = prev.elements[selectedElementId];
      if (!elem) return prev;
      return {
        ...prev,
        elements: {
          ...prev.elements,
          [selectedElementId]: {
            ...elem,
            ...updates
          }
        }
      };
    });
  }, [selectedElementId]);

  const addElement = useCallback(
    (archetypeKey, customProps = {}) => {
      const arch = archetypes[archetypeKey] || ELEMENT_ARCHETYPES[archetypeKey] || ELEMENT_ARCHETYPES.softwareSystem;
      const count = Object.keys(model.elements).length + 1;
      const newId = `${archetypeKey}_${Date.now().toString(36)}`;
      const isBoundary = arch.isBoundary || customProps.isBoundary || false;

      const newElem = {
        id: newId,
        archetypeKey,
        isBoundary,
        enabled: true,
        type: arch.c4Type,
        name: customProps.name || `${arch.label} ${count}`,
        title: customProps.title || (isBoundary ? 'Logical Boundary' : ''),
        description: customProps.description || arch.desc,
        technology: customProps.technology || arch.defaultTech,
        iconId: customProps.iconId || arch.defaultIconId || 'tech:aws',
        tags: [arch.c4Type, archetypeKey, ...(isBoundary ? ['boundary'] : [])],
        customColor: arch.color,
        customBorderColor: arch.border,
        customTextColor: arch.textColor,
        opacity: 1,
        displayOptions: {
          showTitle: true,
          showDescription: true,
          showTechnology: true,
          showTags: true,
          showIcon: true,
          showType: true
        },
        position: customProps.position || {
          x: Math.round(-pan.x + 200 + (count % 3) * 60),
          y: Math.round(-pan.y + 120 + (count % 3) * 50)
        },
        width: isBoundary ? 540 : 228,
        height: isBoundary ? 380 : 128,
        ...(isBoundary
          ? {
              boundaryStyle: {
                borderStyle: 'dashed',
                borderWidth: 2,
                borderColor: arch.border || '#3B82F6',
                fillColor: arch.color || '#1E293B',
                fillOpacity: 0.1
              }
            }
          : {})
      };

      setModel((prev) => ({
        ...prev,
        elements: { ...prev.elements, [newId]: newElem }
      }));
      setSelectedElementId(newId);
      setSelectedRelId(null);
      setIsRightPanelOpen(true);
      showToast(`Added ${arch.label}: "${newElem.name}"`);
    },
    [archetypes, model.elements, pan, showToast]
  );

  const handleAddArchetype = (e) => {
    e.preventDefault();
    if (!newArchetypeForm.label.trim()) {
      showToast('Please provide an archetype label');
      return;
    }
    const cleanKey =
      newArchetypeForm.label.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_') +
      '_' +
      Date.now().toString(36).slice(-4);
    const category =
      newArchetypeForm.category === '__custom__'
        ? newArchetypeForm.customCategory.trim() || 'Custom Archetypes'
        : newArchetypeForm.category;

    const fallbackIcon = newArchetypeForm.isBoundary
      ? Cloud
      : newArchetypeForm.c4Type === 'person'
      ? User
      : Box;

    const createdArchetype = {
      category,
      label: newArchetypeForm.label.trim(),
      c4Type: newArchetypeForm.c4Type,
      isBoundary: newArchetypeForm.isBoundary,
      icon: fallbackIcon,
      defaultIconId: newArchetypeForm.iconId,
      color: newArchetypeForm.color,
      border: newArchetypeForm.border,
      textColor: newArchetypeForm.textColor,
      defaultTech: newArchetypeForm.defaultTech.trim() || 'Custom Tech Stack',
      desc: newArchetypeForm.desc.trim() || 'Custom architectural element'
    };

    setArchetypes((prev) => ({
      ...prev,
      [cleanKey]: createdArchetype
    }));

    setShowAddArchetypeModal(false);
    showToast(`Added archetype: ${createdArchetype.label}`);
  };

  const startConnectingFromPort = (elementId, handle, e) => {
    e.stopPropagation();
    if (connectionStart?.elementId === elementId && connectionStart?.handle === handle) {
      setConnectionStart(null);
      setConnectingSourceId(null);
      showToast('Connection cancelled');
    } else {
      setConnectionStart({ elementId, handle });
      setConnectingSourceId(elementId);
      showToast(`Connecting from ${handle.toUpperCase()} port... Click target node`);
    }
  };

  const startConnecting = (sourceId, e) => {
    e.stopPropagation();
    if (connectionStart?.elementId === sourceId) {
      setConnectionStart(null);
      setConnectingSourceId(null);
    } else {
      setConnectionStart({ elementId: sourceId, handle: 'auto' });
      setConnectingSourceId(sourceId);
      showToast('Click another element to create relationship');
    }
  };

  const completeConnection = (targetId, targetHandle = 'auto') => {
    if (!connectionStart || connectionStart.elementId === targetId) {
      setConnectionStart(null);
      setConnectingSourceId(null);
      return;
    }

    const relId = `rel_${Date.now().toString(36)}`;
    const srcName = model.elements[connectionStart.elementId]?.name || 'Source';
    const tgtName = model.elements[targetId]?.name || 'Target';

    const newRel = {
      id: relId,
      sourceId: connectionStart.elementId,
      targetId,
      sourceHandle: connectionStart.handle || 'auto',
      targetHandle: targetHandle || 'auto',
      title: 'Interacts with',
      technology: 'HTTPS',
      routing: defaultConnectorType || 'orthogonal'
    };

    setModel((prev) => ({
      ...prev,
      relationships: { ...prev.relationships, [relId]: newRel }
    }));

    setConnectionStart(null);
    setConnectingSourceId(null);
    setSelectedRelId(relId);
    setSelectedElementId(null);
    setIsRightPanelOpen(true);
    showToast(`Connected: ${srcName} ➜ ${tgtName}`);
  };

  const toggleElementEnabled = (elementId, e) => {
    if (e) e.stopPropagation();
    setModel((prev) => {
      const current = prev.elements[elementId];
      if (!current) return prev;
      const nextState = current.enabled === false;
      return {
        ...prev,
        elements: {
          ...prev.elements,
          [elementId]: {
            ...current,
            enabled: nextState
          }
        }
      };
    });
  };

  const toggleAllBoundaryChildren = (boundaryId, shouldEnable) => {
    setModel((prev) => {
      const nextElements = { ...prev.elements };
      Object.values(nextElements).forEach((el) => {
        if (el.parentId === boundaryId) {
          nextElements[el.id] = { ...el, enabled: shouldEnable };
        }
      });
      return { ...prev, elements: nextElements };
    });
    showToast(`${shouldEnable ? 'Enabled' : 'Disabled'} all elements inside boundary`);
  };

  const deleteSelectedElement = () => {
    if (!selectedElementId) return;
    const name = model.elements[selectedElementId]?.name || 'Element';

    setModel((prev) => {
      const nextElements = { ...prev.elements };
      delete nextElements[selectedElementId];

      Object.values(nextElements).forEach((el) => {
        if (el.parentId === selectedElementId) {
          nextElements[el.id] = { ...el, parentId: undefined };
        }
      });

      const nextRels = {};
      Object.entries(prev.relationships).forEach(([id, rel]) => {
        if (rel.sourceId !== selectedElementId && rel.targetId !== selectedElementId) {
          nextRels[id] = rel;
        }
      });

      return { ...prev, elements: nextElements, relationships: nextRels };
    });

    setSelectedElementId(null);
    showToast(`Deleted ${name}`);
  };

  const deleteSelectedRelationship = () => {
    if (!selectedRelId) return;
    setModel((prev) => {
      const nextRels = { ...prev.relationships };
      delete nextRels[selectedRelId];
      return { ...prev, relationships: nextRels };
    });
    setSelectedRelId(null);
    showToast('Deleted relationship');
  };

  const handleCreateView = (e) => {
    e.preventDefault();
    if (!newViewForm.id.trim()) {
      showToast('Please provide a valid View ID');
      return;
    }
    const cleanId = newViewForm.id.trim().replace(/[^a-zA-Z0-9_]/g, '_');
    const isDynamic = newViewForm.kind === 'dynamic' || newViewForm.kind === 'usecase';

    const newView = {
      id: cleanId,
      title: newViewForm.title.trim() || cleanId,
      kind: newViewForm.kind,
      description: newViewForm.description.trim(),
      scope: newViewForm.scope || '',
      ...(isDynamic ? { steps: [] } : {})
    };

    setModel((prev) => ({
      ...prev,
      views: {
        ...prev.views,
        [cleanId]: newView
      }
    }));

    setActiveLikeC4ViewId(cleanId);
    setActiveStepIndex(0);
    setShowCreateViewModal(false);
    setNewViewForm({ id: '', title: '', kind: 'dynamic', description: '', scope: '' });
    showToast(`Created ${newView.kind.toUpperCase()} view: "${newView.title}"`);
  };

  const deleteLikeC4View = (viewId, e) => {
    if (e) e.stopPropagation();
    setModel((prev) => {
      const nextViews = { ...prev.views };
      delete nextViews[viewId];
      return { ...prev, views: nextViews };
    });
    if (activeLikeC4ViewId === viewId) {
      setActiveLikeC4ViewId('context');
    }
    showToast(`Deleted view: ${viewId}`);
  };

  const handleAddDynamicStep = (e) => {
    e.preventDefault();
    if (!newStepForm.title.trim()) return;

    const newStep = {
      id: `step_${Date.now().toString(36)}`,
      sourceId: newStepForm.sourceId,
      targetId: newStepForm.targetId,
      title: newStepForm.title.trim(),
      technology: newStepForm.technology.trim()
    };

    setModel((prev) => {
      const v = prev.views[activeLikeC4ViewId];
      if (!v) return prev;
      const updatedSteps = [...(v.steps || []), newStep];
      return {
        ...prev,
        views: {
          ...prev.views,
          [activeLikeC4ViewId]: {
            ...v,
            steps: updatedSteps
          }
        }
      };
    });

    setShowAddStepModal(false);
    setNewStepForm({ sourceId: 'customer', targetId: 'load_balancer', title: '', technology: 'HTTPS' });
    showToast(`Added step to ${activeView?.title}`);
  };

  const deleteDynamicStep = (stepIdx, e) => {
    if (e) e.stopPropagation();
    setModel((prev) => {
      const v = prev.views[activeLikeC4ViewId];
      if (!v || !v.steps) return prev;
      const updatedSteps = v.steps.filter((_, idx) => idx !== stepIdx);
      return {
        ...prev,
        views: {
          ...prev.views,
          [activeLikeC4ViewId]: {
            ...v,
            steps: updatedSteps
          }
        }
      };
    });
    if (activeStepIndex >= stepIdx && activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1);
    }
    showToast('Deleted interaction step');
  };

  const handleMouseDownResize = (e, elemId) => {
    e.stopPropagation();
    const elem = model.elements[elemId];
    if (!elem) return;

    setResizingNodeId(elemId);
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: elem.width || (elem.isBoundary ? 520 : 228),
      height: elem.height || (elem.isBoundary ? 360 : 120)
    };
    setSelectedElementId(elemId);
    setSelectedRelId(null);
    setIsRightPanelOpen(true);
  };

  const handleMouseDownNode = (e, id) => {
    e.stopPropagation();
    setIsRightPanelOpen(true);
    if (connectionStart) {
      completeConnection(id, 'auto');
      return;
    }

    setSelectedElementId(id);
    setSelectedRelId(null);
    setDraggingNodeId(id);

    const elem = model.elements[id];
    const mouseX = (e.clientX - pan.x) / zoom;
    const mouseY = (e.clientY - pan.y) / zoom;

    setDragOffset({
      x: mouseX - (elem.position?.x || 0),
      y: mouseY - (elem.position?.y || 0)
    });

    if (elem.isBoundary) {
      dragBoundaryInitialPos.current = { x: elem.position?.x || 0, y: elem.position?.y || 0 };
      const childrenCoords = {};
      Object.values(model.elements).forEach((child) => {
        if (child.parentId === id) {
          childrenCoords[child.id] = {
            x: child.position?.x || 0,
            y: child.position?.y || 0
          };
        }
      });
      dragBoundaryChildrenInitialPos.current = childrenCoords;
    } else {
      dragBoundaryChildrenInitialPos.current = {};
    }
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.tagName === 'svg') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedElementId(null);
      setSelectedRelId(null);
      setConnectionStart(null);
      setConnectingSourceId(null);
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    } else if (resizingNodeId) {
      const deltaX = (e.clientX - resizeStartRef.current.mouseX) / zoom;
      const deltaY = (e.clientY - resizeStartRef.current.mouseY) / zoom;
      const isBoundary = model.elements[resizingNodeId]?.isBoundary;
      const minW = isBoundary ? 280 : 160;
      const minH = isBoundary ? 180 : 80;

      const newWidth = Math.max(minW, Math.round(resizeStartRef.current.width + deltaX));
      const newHeight = Math.max(minH, Math.round(resizeStartRef.current.height + deltaY));

      setModel((prev) => ({
        ...prev,
        elements: {
          ...prev.elements,
          [resizingNodeId]: {
            ...prev.elements[resizingNodeId],
            width: newWidth,
            height: newHeight
          }
        }
      }));
    } else if (draggingNodeId) {
      const mouseX = (e.clientX - pan.x) / zoom;
      const mouseY = (e.clientY - pan.y) / zoom;
      const newX = Math.round(mouseX - dragOffset.x);
      const newY = Math.round(mouseY - dragOffset.y);

      const draggedElem = model.elements[draggingNodeId];
      if (!draggedElem) return;

      if (draggedElem.isBoundary) {
        const deltaX = newX - dragBoundaryInitialPos.current.x;
        const deltaY = newY - dragBoundaryInitialPos.current.y;

        setModel((prev) => {
          const nextElements = { ...prev.elements };
          nextElements[draggingNodeId] = {
            ...nextElements[draggingNodeId],
            position: { x: newX, y: newY }
          };

          Object.entries(dragBoundaryChildrenInitialPos.current).forEach(([childId, initialPos]) => {
            if (nextElements[childId]) {
              nextElements[childId] = {
                ...nextElements[childId],
                position: {
                  x: Math.round(initialPos.x + deltaX),
                  y: Math.round(initialPos.y + deltaY)
                }
              };
            }
          });

          return { ...prev, elements: nextElements };
        });
      } else {
        setModel((prev) => ({
          ...prev,
          elements: {
            ...prev.elements,
            [draggingNodeId]: {
              ...prev.elements[draggingNodeId],
              position: { x: newX, y: newY }
            }
          }
        }));
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
    setResizingNodeId(null);
    dragBoundaryChildrenInitialPos.current = {};
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    let newZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    newZoom = Math.min(Math.max(newZoom, 0.3), 2.5);
    setZoom(newZoom);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const archetypeKey = e.dataTransfer.getData('application/c4-archetype');
    if (!archetypeKey) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const dropX = (e.clientX - rect.left - pan.x) / zoom;
    const dropY = (e.clientY - rect.top - pan.y) / zoom;

    addElement(archetypeKey, {
      position: { x: Math.round(dropX - 110), y: Math.round(dropY - 55) }
    });
  };

  const exportContent = useMemo(() => {
    switch (exportFormat) {
      case 'likec4':
        return Serializers.toLikeC4(model);
      case 'mermaid':
        return Serializers.toMermaid(model, activeLikeC4ViewId);
      case 'drawio':
        return Serializers.toDrawio(model);
      case 'json':
        return JSON.stringify(model, null, 2);
      case 'svg':
        return Serializers.toSvg(model, isDark);
      default:
        return '';
    }
  }, [exportFormat, model, isDark, activeLikeC4ViewId]);

  const downloadFile = (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`);
  };

  const triggerExportDownload = () => {
    switch (exportFormat) {
      case 'likec4':
        downloadFile('architecture.c4', exportContent, 'text/plain');
        break;
      case 'mermaid':
        downloadFile('diagram.mmd', exportContent, 'text/plain');
        break;
      case 'drawio':
        downloadFile('diagram.drawio', exportContent, 'application/xml');
        break;
      case 'json':
        downloadFile('architecture.json', exportContent, 'application/json');
        break;
      case 'svg':
        downloadFile('architecture.svg', exportContent, 'image/svg+xml');
        break;
      case 'png': {
        const svgContent = Serializers.toSvg(model, isDark);
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const URLObj = window.URL || window.webkitURL || window;
        const blobURL = URLObj.createObjectURL(svgBlob);
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 1600;
          canvas.height = 1000;
          const context = canvas.getContext('2d');
          context.fillStyle = isDark ? '#090D16' : '#F8FAFC';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0);
          canvas.toBlob((blob) => {
            const link = document.createElement('a');
            link.download = 'architecture.png';
            link.href = URLObj.createObjectURL(blob);
            link.click();
            showToast('Downloaded architecture.png');
          });
        };
        image.src = blobURL;
        break;
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  const resetTemplate = () => {
    setModel(INITIAL_MODEL);
    setPan({ x: 30, y: 30 });
    setZoom(1);
    setSelectedElementId(null);
    setSelectedRelId(null);
    setActiveLikeC4ViewId('context');
    setActiveStepIndex(0);
    setIsPlayingFlow(false);
    showToast('Reset diagram to Enterprise Banking Architecture');
  };

  const activeElement = selectedElementId ? model.elements[selectedElementId] : null;
  const activeRel = selectedRelId ? model.relationships[selectedRelId] : null;

  const visibleElements = useMemo(() => {
    return Object.values(model.elements).filter((elem) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          elem.name?.toLowerCase().includes(q) ||
          elem.technology?.toLowerCase().includes(q) ||
          elem.description?.toLowerCase().includes(q) ||
          elem.type?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (currentLayerFilter === 'all') return true;
      if (currentLayerFilter === 'context') return elem.type === 'person' || elem.type === 'softwareSystem';
      if (currentLayerFilter === 'container') return elem.type === 'container' || elem.isBoundary;
      if (currentLayerFilter === 'component') return elem.type === 'component';
      if (currentLayerFilter === 'deployment') return elem.type === 'deploymentNode' || elem.isBoundary;
      return true;
    });
  }, [model.elements, currentLayerFilter, searchQuery]);

  const boundaryElements = useMemo(() => {
    return visibleElements.filter((e) => e.isBoundary);
  }, [visibleElements]);

  const regularElements = useMemo(() => {
    return visibleElements.filter((e) => !e.isBoundary);
  }, [visibleElements]);

  const categorizedArchetypes = useMemo(() => {
    const groups = {};
    Object.entries(archetypes).forEach(([key, item]) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push({ key, ...item });
    });
    return groups;
  }, [archetypes]);

  /* Element counts per layer */
  const layerCounts = useMemo(() => {
    const all = Object.values(model.elements);
    return {
      all: all.length,
      context: all.filter((e) => e.type === 'person' || e.type === 'softwareSystem').length,
      container: all.filter((e) => e.type === 'container' || e.isBoundary).length,
      component: all.filter((e) => e.type === 'component').length,
      deployment: all.filter((e) => e.type === 'deploymentNode' || e.isBoundary).length
    };
  }, [model.elements]);

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden font-sans select-none transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {}
      <header
        className={`h-14 px-4 flex items-center justify-between border-b backdrop-blur z-20 transition-colors ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-sm'
            : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-500 shadow-sm shadow-blue-500/20 ring-1 ring-white/20">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight">LikeC4 Studio</span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
                v2.4
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              View: {model.views[activeLikeC4ViewId]?.title || activeLikeC4ViewId}
            </div>
          </div>
        </div>

        {/* Center: Search & View Mode Switcher */}
        <div className="flex items-center gap-3">
          <div
            className={`hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs ${
              isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-100/80 border-slate-200 text-slate-700'
            }`}
          >
            <Search className="w-3.5 h-3.5 opacity-60" />
            <input
              type="text"
              placeholder="Search elements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-36 placeholder:text-slate-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-0.5 hover:text-slate-400">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div
            className={`flex items-center p-0.5 rounded-lg border ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              onClick={() => setActiveViewMode('canvas')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
                activeViewMode === 'canvas'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Canvas</span>
            </button>
            <button
              onClick={() => setActiveViewMode('code')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
                activeViewMode === 'code'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>LikeC4 DSL</span>
            </button>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetTemplate}
            className={`p-1.5 rounded-lg border text-xs transition ${
              isDark
                ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                : 'border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
            title="Reset Architecture Template"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border text-xs transition ${
              isDark
                ? 'border-slate-800 hover:bg-slate-800 text-amber-400'
                : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </header>

      {}
      {/* MAIN WORKSPACE LAYOUT */}
      <div className="flex flex-1 overflow-hidden relative">
        <aside
          style={{ width: `${leftPanelWidth}px` }}
          className={`flex flex-col z-10 shrink-0 transition-colors border-r ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {/* Main 3 Tabs: Model, Views, Palette */}
          <div
            className={`flex items-center border-b p-1.5 gap-1 ${
              isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-100/70'
            }`}
          >
            {[
              { id: 'model', label: 'Model', icon: FolderTree },
              { id: 'views', label: 'Views', icon: Compass },
              { id: 'palette', label: 'Palette', icon: Box }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = leftTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setLeftTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition-all ${
                    isActive
                      ? isDark
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-blue-700 shadow-xs border border-slate-200'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* MODEL TAB */}
          {leftTab === 'model' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Architecture Entities ({Object.keys(model.elements).length})
                </span>
              </div>

              <div className="space-y-1">
                {Object.values(model.elements)
                  .filter((e) => !e.parentId)
                  .map((rootElem) => {
                    const arch =
                      ELEMENT_ARCHETYPES[rootElem.archetypeKey] || ELEMENT_ARCHETYPES.softwareSystem;
                    const Icon = arch.icon;
                    const children = Object.values(model.elements).filter(
                      (c) => c.parentId === rootElem.id
                    );
                    const isSelected = selectedElementId === rootElem.id;
                    const isMuted = rootElem.enabled === false;

                    return (
                      <div key={rootElem.id} className="space-y-1">
                        <div
                          onClick={() => {
                            setSelectedElementId(rootElem.id);
                            setSelectedRelId(null);
                            setIsRightPanelOpen(true);
                          }}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                              : isDark
                              ? 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 text-slate-200'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                          } ${isMuted ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                            <span className="font-semibold truncate">{rootElem.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {rootElem.isBoundary && (
                              <span className="text-[9px] font-semibold uppercase px-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                Boundary
                              </span>
                            )}
                            <button
                              onClick={(e) => toggleElementEnabled(rootElem.id, e)}
                              title={isMuted ? 'Enable Element' : 'Disable Element'}
                              className={`p-1 rounded hover:scale-110 transition ${
                                isMuted ? 'text-slate-400' : 'text-emerald-400'
                              }`}
                            >
                              <Power className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {children.length > 0 && (
                          <div className="pl-4 space-y-1 border-l-2 border-slate-700/30 ml-2">
                            {children.map((child) => {
                              const childArch =
                                ELEMENT_ARCHETYPES[child.archetypeKey] ||
                                ELEMENT_ARCHETYPES.container;
                              const ChildIcon = childArch.icon;
                              const isChildSelected = selectedElementId === child.id;
                              const isChildMuted = child.enabled === false;

                              return (
                                <div
                                  key={child.id}
                                  onClick={() => {
                                    setSelectedElementId(child.id);
                                    setSelectedRelId(null);
                                    setIsRightPanelOpen(true);
                                  }}
                                  className={`flex items-center justify-between p-1.5 rounded-md border text-xs cursor-pointer transition ${
                                    isChildSelected
                                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                                      : isDark
                                      ? 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800 text-slate-300'
                                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                                  } ${isChildMuted ? 'opacity-50' : ''}`}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <ChildIcon className="w-3 h-3 shrink-0 opacity-80" />
                                    <span className="truncate">{child.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-[9px] font-mono opacity-70">
                                      [{child.type}]
                                    </span>
                                    <button
                                      onClick={(e) => toggleElementEnabled(child.id, e)}
                                      title={isChildMuted ? 'Enable Element' : 'Disable Element'}
                                      className={`p-0.5 rounded transition ${
                                        isChildMuted ? 'text-slate-400' : 'text-emerald-400'
                                      }`}
                                    >
                                      <Power className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* VIEWS & LAYERS TAB */}
          {leftTab === 'views' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* SECTION 1: C4 ABSTRACTION LAYERS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    C4 Abstraction Layers
                  </span>
                  <span className="text-[10px] font-mono text-blue-400">
                    {layerCounts[currentLayerFilter]} active
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-1">
                  {[
                    { id: 'all', label: 'All Layers', count: layerCounts.all },
                    { id: 'context', label: '1. Context Layer', count: layerCounts.context },
                    { id: 'container', label: '2. Container Layer', count: layerCounts.container },
                    { id: 'component', label: '3. Component Layer', count: layerCounts.component },
                    { id: 'deployment', label: '4. Deployment Layer', count: layerCounts.deployment }
                  ].map((layer) => {
                    const isSelected = currentLayerFilter === layer.id;
                    return (
                      <button
                        key={layer.id}
                        onClick={() => {
                          setCurrentLayerFilter(layer.id);
                          showToast(`Filtered: ${layer.label}`);
                        }}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          isSelected
                            ? isDark
                              ? 'bg-blue-600/25 border-blue-500 text-blue-200 shadow-xs'
                              : 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs font-semibold'
                            : isDark
                            ? 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-blue-500 ring-2 ring-blue-500/30' : 'bg-slate-500'
                            }`}
                          />
                          <span>{layer.label}</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                            isSelected
                              ? 'bg-blue-500 text-white'
                              : isDark
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {layer.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={`h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

              {/* SECTION 2: DYNAMIC VIEWS & USE CASES */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Workflow className="w-3.5 h-3.5 text-amber-500" />
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isDark ? 'text-amber-400' : 'text-amber-600'
                      }`}
                    >
                      Dynamic & Use Cases ({Object.values(model.views).filter((v) => v.kind === 'dynamic' || v.kind === 'usecase').length})
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setNewViewForm({ id: '', title: '', kind: 'dynamic', description: '', scope: '' });
                      setShowCreateViewModal(true);
                    }}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-600/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold hover:bg-amber-600/30"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Flow</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {Object.values(model.views)
                    .filter((v) => v.kind === 'dynamic' || v.kind === 'usecase')
                    .map((view) => {
                      const isActive = activeLikeC4ViewId === view.id;
                      const stepCount = (view.steps || []).length;
                      return (
                        <div
                          key={view.id}
                          onClick={() => {
                            setActiveLikeC4ViewId(view.id);
                            setActiveStepIndex(0);
                            setIsPlayingFlow(false);
                          }}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                            isActive
                              ? isDark
                                ? 'bg-amber-950/40 border-amber-500 text-white ring-1 ring-amber-500/40'
                                : 'bg-amber-50/90 border-amber-400 text-amber-950 ring-1 ring-amber-400/50 shadow-xs'
                              : isDark
                              ? 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 text-slate-300'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Activity className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="font-semibold text-xs truncate">{view.title}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[9px] font-mono px-1 rounded bg-amber-500/20 text-amber-400 uppercase">
                                {view.kind}
                              </span>
                              <button
                                onClick={(e) => deleteLikeC4View(view.id, e)}
                                className="text-slate-400 hover:text-red-400 p-0.5 rounded"
                                title="Delete flow"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="truncate max-w-[180px]">{view.description || 'Sequential flow'}</span>
                            <span className="font-mono text-amber-400 font-semibold">{stepCount} steps</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className={`h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

              {/* SECTION 3: ARCHITECTURE STATIC VIEWS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Static Architecture Views
                  </span>
                  <button
                    onClick={() => {
                      setNewViewForm({ id: '', title: '', kind: 'container', description: '', scope: '' });
                      setShowCreateViewModal(true);
                    }}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold hover:bg-blue-600/30"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New View</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {Object.values(model.views)
                    .filter((v) => v.kind !== 'dynamic' && v.kind !== 'usecase')
                    .map((view) => {
                      const isActive = activeLikeC4ViewId === view.id;
                      return (
                        <div
                          key={view.id}
                          onClick={() => setActiveLikeC4ViewId(view.id)}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                            isActive
                              ? isDark
                                ? 'bg-blue-950/70 border-blue-500 text-white ring-1 ring-blue-500/50'
                                : 'bg-blue-50/80 border-blue-400 text-blue-950 ring-1 ring-blue-400/40'
                              : isDark
                              ? 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 text-slate-300'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Compass className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span className="font-semibold text-xs truncate">{view.title}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[9px] font-mono px-1 rounded bg-black/20 uppercase">
                                {view.kind}
                              </span>
                              {view.id !== 'landscape' && (
                                <button
                                  onClick={(e) => deleteLikeC4View(view.id, e)}
                                  className="text-slate-400 hover:text-red-400 p-0.5 rounded"
                                  title="Delete view"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          {view.description && (
                            <div className="text-[10px] text-slate-400 line-clamp-1">{view.description}</div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* PALETTE TAB */}
          {leftTab === 'palette' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              <div className="flex items-center justify-between text-[11px]">
                <span
                  className={`font-semibold uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Component Archetypes
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setNewArchetypeForm({
                      label: '',
                      category: 'Compute & Routing',
                      customCategory: '',
                      c4Type: 'container',
                      isBoundary: false,
                      defaultTech: '',
                      desc: '',
                      iconId: 'tech:nodejs',
                      color: '#0D9488',
                      border: '#0F766E',
                      textColor: '#FFFFFF'
                    });
                    setShowAddArchetypeModal(true);
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 text-[10px] font-bold transition"
                  title="Create new component archetype"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Archetype</span>
                </button>
              </div>

              {Object.entries(categorizedArchetypes).map(([category, items]) => (
                <div key={category} className="space-y-1.5">
                  <div
                    className={`text-[10px] font-bold uppercase tracking-wider px-1 ${
                      category === 'Boundaries & Enclosures'
                        ? 'text-amber-500 font-extrabold flex items-center gap-1'
                        : isDark
                        ? 'text-blue-400'
                        : 'text-blue-600'
                    }`}
                  >
                    {category === 'Boundaries & Enclosures' && <Sparkles className="w-3 h-3" />}
                    <span>{category}</span>
                  </div>
                  <div className="space-y-1.5">
                    {items.map((item) => {
                      const IconComp = item.icon;
                      return (
                        <div
                          key={item.key}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('application/c4-archetype', item.key);
                          }}
                          onClick={() => addElement(item.key)}
                          className={`group flex items-center justify-between p-2 rounded-lg border cursor-grab active:cursor-grabbing transition-all ${
                            item.isBoundary
                              ? isDark
                                ? 'bg-amber-950/20 border-amber-800/40 hover:bg-amber-900/30 hover:border-amber-600'
                                : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100 hover:border-amber-300 shadow-2xs'
                              : isDark
                              ? 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="p-1.5 rounded-md shrink-0 shadow-xs"
                              style={{ backgroundColor: item.color, color: item.textColor }}
                            >
                              <IconComp className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div
                                className={`text-xs font-semibold truncate ${
                                  isDark ? 'text-slate-200' : 'text-slate-800'
                                }`}
                              >
                                {item.label}
                              </div>
                              <div
                                className={`text-[10px] truncate ${
                                  isDark ? 'text-slate-400' : 'text-slate-500'
                                }`}
                              >
                                {item.defaultTech || item.c4Type}
                              </div>
                            </div>
                          </div>
                          <Plus
                            className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition shrink-0 ${
                              isDark ? 'text-slate-400' : 'text-slate-600'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Resizer Left */}
        <div
          onMouseDown={startResizeLeft}
          className={`w-1.5 hover:w-2 hover:bg-blue-500 cursor-col-resize z-20 flex items-center justify-center transition-colors group ${
            isDark ? 'bg-slate-800 hover:bg-blue-500' : 'bg-slate-200 hover:bg-blue-500'
          }`}
          title="Drag to resize sidebar"
        >
          <div className="w-0.5 h-6 bg-slate-400 rounded-full group-hover:bg-white" />
        </div>

        {}
        <main className="flex-1 relative flex flex-col overflow-hidden">
          {activeViewMode === 'canvas' ? (
            <div
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`flex-1 relative overflow-hidden cursor-crosshair select-none ${
                isDark ? 'bg-[#090D16]' : 'bg-[#F8FAFC]'
              }`}
              style={{
                backgroundImage: showGrid
                  ? isDark
                    ? 'radial-gradient(#1E293B 1.2px, transparent 1.2px)'
                    : 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)'
                  : 'none',
                backgroundSize: '24px 24px'
              }}
            >
              {/* COMPACT FLOATING DYNAMIC FLOW CONTROLLER WITH DIAGRAM/SEQUENCE TOGGLE */}
              {isDynamicOrUseCase && (
                <div
                  className={`absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-2.5 py-1 rounded-lg border shadow-xl backdrop-blur transition-all ${
                    isDark
                      ? 'bg-slate-900/95 border-amber-500/40 text-slate-100 ring-1 ring-amber-500/25'
                      : 'bg-white/95 border-amber-400 text-slate-900 ring-1 ring-amber-300 shadow-md'
                  }`}
                >
                  {/* Flow Badge & Title */}
                  <div className="flex items-center gap-1.5 pr-1.5 border-r border-slate-700/40">
                    <Workflow className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-[11px] font-bold truncate max-w-[130px]">
                      {activeView.title}
                    </span>
                  </div>

                  {/* Diagram vs Sequence Segmented Toggle */}
                  <div
                    className={`flex items-center p-0.5 rounded-md border text-[10px] font-semibold ${
                      isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setDynamicPresentationMode('diagram')}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded transition ${
                        dynamicPresentationMode === 'diagram'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isDark
                          ? 'text-slate-400 hover:text-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Show on 2D Architecture Diagram"
                    >
                      <Layers className="w-3 h-3" />
                      <span>Diagram</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDynamicPresentationMode('sequence')}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded transition ${
                        dynamicPresentationMode === 'sequence'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : isDark
                          ? 'text-slate-400 hover:text-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Show as Sequential Lifeline Diagram"
                    >
                      <ListOrdered className="w-3 h-3" />
                      <span>Sequence</span>
                    </button>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center gap-1 pl-1 border-l border-slate-700/40">
                    <button
                      type="button"
                      onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                      disabled={activeStepIndex === 0}
                      className="p-1 rounded hover:bg-black/15 disabled:opacity-30 transition"
                      title="Previous Step"
                    >
                      <SkipBack className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPlayingFlow(!isPlayingFlow)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                        isPlayingFlow
                          ? 'bg-amber-600 text-white ring-1 ring-amber-400'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {isPlayingFlow ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span>{isPlayingFlow ? 'Pause' : 'Play'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveStepIndex((prev) => (prev + 1) % Math.max(1, dynamicSteps.length))}
                      className="p-1 rounded hover:bg-black/15 transition"
                      title="Next Step"
                    >
                      <SkipForward className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Step Info */}
                  {currentStep && (
                    <div className="pl-1.5 border-l border-slate-700/40 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {activeStepIndex + 1}
                      </span>
                      <div className="max-w-[150px] leading-tight truncate">
                        <span className="text-[11px] font-semibold truncate block">
                          {currentStep.title}
                        </span>
                        {currentStep.technology && (
                          <span className="text-[9px] text-slate-400 font-mono truncate block">
                            [{currentStep.technology}]
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowAddStepModal(true)}
                    className="p-1 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/40 transition"
                    title="Add dynamic step"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* DEDICATED SEQUENCE DIAGRAM VIEW (WHEN TOGGLED) */}
              {isDynamicOrUseCase && dynamicPresentationMode === 'sequence' ? (
                <div className="absolute inset-0 z-10 overflow-auto p-8 pt-16 flex flex-col items-center">
                  <div
                    className={`min-w-[760px] max-w-5xl w-full p-6 rounded-2xl border shadow-2xl backdrop-blur ${
                      isDark
                        ? 'bg-slate-900/95 border-slate-800 text-slate-100'
                        : 'bg-white/95 border-slate-200 text-slate-900 shadow-xl'
                    }`}
                  >
                    {/* Header info bar */}
                    <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-700/40">
                      <div>
                        <h2 className="text-sm font-bold flex items-center gap-2">
                          <ListOrdered className="w-4 h-4 text-amber-500" />
                          <span>{activeView.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase font-semibold">
                            UML Sequence View
                          </span>
                        </h2>
                        {activeView.description && (
                          <p className="text-xs text-slate-400 mt-0.5">{activeView.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-mono">
                          Step <span className="text-amber-400 font-bold">{activeStepIndex + 1}</span> of {dynamicSteps.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAddStepModal(true)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 text-xs font-semibold transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Step</span>
                        </button>
                      </div>
                    </div>

                    {/* Sequence Diagram Grid Container */}
                    <div className="relative pt-2 pb-6 select-none">
                      {/* 1. TOP PARTICIPANT HEADER BOXES */}
                      <div className="flex w-full relative z-20">
                        {sequenceParticipants.map((p) => {
                          const arch = ELEMENT_ARCHETYPES[p.archetypeKey] || ELEMENT_ARCHETYPES.softwareSystem;
                          const IconComp = arch.icon;
                          const isParticipantActive =
                            currentStep &&
                            (currentStep.sourceId === p.id || currentStep.targetId === p.id);

                          return (
                            <div key={p.id} className="flex-1 flex justify-center px-2">
                              <div
                                style={{ backgroundColor: p.customColor || arch.color }}
                                className={`w-full max-w-[170px] px-3 py-2.5 rounded-lg text-white text-center shadow-md border transition-all ${
                                  isParticipantActive
                                    ? 'ring-4 ring-amber-400/60 scale-102 border-amber-300'
                                    : 'border-white/20'
                                }`}
                              >
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                  <LikeC4Icon iconId={p.iconId} fallbackIcon={IconComp} className="w-4 h-4 shrink-0" />
                                  <span className="text-[12px] font-bold truncate">{p.name}</span>
                                </div>
                                <span className="text-[9px] font-mono opacity-85 uppercase tracking-wider block">
                                  :{p.type}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* 2. BODY WITH CONTINUOUS VERTICAL LIFELINES & STEP MESSAGES */}
                      <div className="relative mt-4 min-h-[340px]">
                        {/* CONTINUOUS VERTICAL LIFELINES (Dashed Lines Running Top-to-Bottom) */}
                        <div className="absolute inset-0 pointer-events-none z-0">
                          {sequenceParticipants.map((p, pIdx) => {
                            const total = Math.max(1, sequenceParticipants.length);
                            const centerX = ((pIdx + 0.5) * 100) / total;
                            return (
                              <div
                                key={`lifeline-${p.id}`}
                                className="absolute top-0 bottom-0 -translate-x-1/2 flex flex-col items-center"
                                style={{ left: `${centerX}%` }}
                              >
                                <div
                                  className={`w-[2px] h-full border-l-2 border-dashed ${
                                    isDark ? 'border-slate-700/80' : 'border-slate-300'
                                  }`}
                                />
                              </div>
                            );
                          })}
                        </div>

                        {/* STEP INTERACTIONS STACK */}
                        <div className="relative z-10 flex flex-col gap-6 py-4">
                          {dynamicSteps.map((step, idx) => {
                            const rawSrcIdx = sequenceParticipants.findIndex((p) => p.id === step.sourceId);
                            const rawTgtIdx = sequenceParticipants.findIndex((p) => p.id === step.targetId);
                            const srcIdx = rawSrcIdx >= 0 ? rawSrcIdx : 0;
                            const tgtIdx = rawTgtIdx >= 0 ? rawTgtIdx : Math.min(1, sequenceParticipants.length - 1);
                            const total = Math.max(1, sequenceParticipants.length);
                            const colWidth = 100 / total;
                            const srcX = (srcIdx + 0.5) * colWidth;
                            const tgtX = (tgtIdx + 0.5) * colWidth;
                            const isCurrent = idx === activeStepIndex;
                            const isRight = tgtX >= srcX;
                            const isSelfCall = srcIdx === tgtIdx;
                            const minX = Math.min(srcX, tgtX);
                            const maxX = Math.max(srcX, tgtX);

                            return (
                              <div
                                key={step.id || idx}
                                onClick={() => setActiveStepIndex(idx)}
                                className={`relative h-20 w-full shrink-0 rounded-xl cursor-pointer transition-all flex items-center ${
                                  isCurrent
                                    ? isDark
                                      ? 'bg-amber-950/20 ring-1 ring-amber-500/40'
                                      : 'bg-amber-50/70 ring-1 ring-amber-400/50'
                                    : 'hover:bg-slate-500/5'
                                }`}
                              >
                                {/* A. SOURCE ACTIVATION OCCURRENCE RECTANGLE BOX */}
                                <div
                                  title={`${model.elements[step.sourceId]?.name || 'Source'} (Active)`}
                                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-14 rounded-[2px] border shadow-xs z-20 transition-all ${
                                    isCurrent
                                      ? 'bg-amber-400 border-amber-300 ring-2 ring-amber-400/50 shadow-md scale-105'
                                      : isDark
                                      ? 'bg-slate-800 border-slate-600'
                                      : 'bg-slate-100 border-slate-400'
                                  }`}
                                  style={{ left: `${srcX}%` }}
                                />

                                {/* B. TARGET ACTIVATION OCCURRENCE RECTANGLE BOX (IF NOT SELF-CALL) */}
                                {!isSelfCall && (
                                  <div
                                    title={`${model.elements[step.targetId]?.name || 'Target'} (Active)`}
                                    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-14 rounded-[2px] border shadow-xs z-20 transition-all ${
                                      isCurrent
                                        ? 'bg-amber-400 border-amber-300 ring-2 ring-amber-400/50 shadow-md scale-105'
                                        : isDark
                                        ? 'bg-slate-800 border-slate-600'
                                        : 'bg-slate-100 border-slate-400'
                                    }`}
                                    style={{ left: `${tgtX}%` }}
                                  />
                                )}

                                {/* C. HORIZONTAL MESSAGE ARROW & CALL LABELS */}
                                {isSelfCall ? (
                                  /* Self-Call Loopback Message */
                                  <div
                                    className="absolute top-1/2 -translate-y-1/2 flex items-center z-15"
                                    style={{ left: `calc(${srcX}% + 7px)` }}
                                  >
                                    <svg width="48" height="40" className="overflow-visible">
                                      <path
                                        d="M 0 8 L 32 8 L 32 32 L 2 32"
                                        fill="none"
                                        stroke={isCurrent ? '#F59E0B' : isDark ? '#64748B' : '#94A3B8'}
                                        strokeWidth={isCurrent ? '2.5' : '1.75'}
                                      />
                                      <polygon
                                        points="6,28 0,32 6,36"
                                        fill={isCurrent ? '#F59E0B' : isDark ? '#64748B' : '#94A3B8'}
                                      />
                                    </svg>
                                    <div
                                      className={`ml-3 px-3 py-1 rounded-full border text-[11px] flex items-center gap-1.5 shadow-md backdrop-blur whitespace-nowrap z-25 ${
                                        isCurrent
                                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-300 ring-2 ring-amber-400/40 scale-105'
                                          : isDark
                                          ? 'bg-slate-800/95 border-slate-700 text-slate-200'
                                          : 'bg-white/95 border-slate-300 text-slate-800'
                                      }`}
                                    >
                                      <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${isCurrent ? 'bg-black/25 text-white' : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                                        {idx + 1}
                                      </span>
                                      <span className="font-semibold max-w-[240px] truncate">{step.title}</span>
                                      {step.technology && (
                                        <span className="font-mono text-[9px] opacity-80 shrink-0">
                                          [{step.technology}]
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        title="Delete step"
                                        onClick={(e) => deleteDynamicStep(idx, e)}
                                        className="ml-1 p-0.5 text-slate-400 hover:text-red-400 rounded transition shrink-0"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  /* Point-to-Point Message Arrow */
                                  <>
                                    {/* Arrow connecting horizontal line */}
                                    <div
                                      className="absolute top-1/2 -translate-y-1/2 transition-colors z-10"
                                      style={{
                                        left: `calc(${minX}% + 7px)`,
                                        width: `calc(${maxX - minX}% - 14px)`,
                                        height: isCurrent ? '2.5px' : '2px',
                                        backgroundColor: isCurrent ? '#F59E0B' : isDark ? '#64748B' : '#94A3B8'
                                      }}
                                    />

                                    {/* Arrowhead pointed directly at target activation box */}
                                    <div
                                      className={`absolute top-1/2 -translate-y-1/2 font-bold leading-none select-none z-15 text-xs ${
                                        isCurrent ? 'text-amber-500 scale-125' : isDark ? 'text-slate-400' : 'text-slate-500'
                                      }`}
                                      style={{
                                        left: isRight ? `calc(${tgtX}% - 7px)` : `calc(${tgtX}% + 7px)`,
                                        transform: isRight
                                          ? 'translate(-100%, -50%)'
                                          : 'translate(0%, -50%)'
                                      }}
                                    >
                                      {isRight ? '▶' : '◀'}
                                    </div>

                                    {/* Message Callout Badge positioned safely ABOVE the horizontal line */}
                                    <div
                                      className={`absolute bottom-[calc(50%+8px)] px-3 py-1 rounded-full border text-[11px] flex items-center gap-1.5 shadow-md backdrop-blur z-25 transition-all ${
                                        isCurrent
                                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-300 ring-2 ring-amber-400/40 scale-105'
                                          : isDark
                                          ? 'bg-slate-800/95 border-slate-700 text-slate-200 hover:border-slate-500'
                                          : 'bg-white/95 border-slate-300 text-slate-800 hover:border-slate-400 shadow-xs'
                                      }`}
                                      style={{
                                        left: `${(srcX + tgtX) / 2}%`,
                                        transform: 'translateX(-50%)'
                                      }}
                                    >
                                      <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${isCurrent ? 'bg-black/25 text-white' : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                                        {idx + 1}
                                      </span>
                                      <span className="font-semibold max-w-[280px] truncate">{step.title}</span>
                                      {step.technology && (
                                        <span className="font-mono text-[9px] opacity-80 shrink-0">
                                          [{step.technology}]
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        title="Delete step"
                                        onClick={(e) => deleteDynamicStep(idx, e)}
                                        className="ml-1 p-0.5 text-slate-400 hover:text-red-400 rounded transition shrink-0"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* 3. BOTTOM TERMINUS PARTICIPANT BOXES */}
                        <div className="flex w-full relative z-20 mt-6 pt-3 border-t border-slate-700/30">
                          {sequenceParticipants.map((p) => {
                            const arch = ELEMENT_ARCHETYPES[p.archetypeKey] || ELEMENT_ARCHETYPES.softwareSystem;
                            return (
                              <div key={`footer-${p.id}`} className="flex-1 flex justify-center px-2">
                                <div
                                  style={{ backgroundColor: p.customColor || arch.color }}
                                  className="w-full max-w-[140px] px-2 py-1 rounded text-white text-center shadow-xs border border-white/20 opacity-80"
                                >
                                  <span className="text-[11px] font-semibold truncate block">{p.name}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* LAYER 1: NESTED BOUNDARIES */}
              <div
                className="absolute inset-0 origin-top-left pointer-events-none"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  zIndex: 1
                }}
              >
                {boundaryElements.map((boundary) => {
                  const isSelected = selectedElementId === boundary.id;
                  const isMuted = boundary.enabled === false;
                  const x = boundary.position?.x || 0;
                  const y = boundary.position?.y || 0;
                  const w = boundary.width || 520;
                  const h = boundary.height || 360;
                  const bStyle = boundary.boundaryStyle || {};
                  const disp = boundary.displayOptions || {};
                  const childrenCount = Object.values(model.elements).filter(
                    (e) => e.parentId === boundary.id
                  ).length;
                  const fillOpacity = bStyle.fillOpacity !== undefined
                    ? bStyle.fillOpacity
                    : (boundary.opacity !== undefined && boundary.opacity <= 1 ? boundary.opacity : 0.12);
                  const effectiveDivOpacity = isMuted ? 0.35 : 1;

                  return (
                    <div
                      key={boundary.id}
                      onMouseDown={(e) => handleMouseDownNode(e, boundary.id)}
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                        width: `${w}px`,
                        height: `${h}px`,
                        borderStyle: bStyle.borderStyle || 'dashed',
                        borderWidth: `${bStyle.borderWidth || 2}px`,
                        borderColor: isSelected ? '#F59E0B' : bStyle.borderColor || '#3B82F6',
                        backgroundColor: hexToRgba(bStyle.fillColor || '#1E293B', fillOpacity),
                        opacity: effectiveDivOpacity
                      }}
                      className={`group absolute rounded-xl pointer-events-auto cursor-move select-none transition-shadow ${
                        isSelected
                          ? 'ring-4 ring-amber-400/40 shadow-xl'
                          : 'shadow-md hover:border-blue-400'
                      }`}
                    >
                      {['top', 'right', 'bottom', 'left'].map((side) => {
                        const isPortActive =
                          connectionStart?.elementId === boundary.id &&
                          connectionStart?.handle === side;
                        const posClass =
                          side === 'top'
                            ? '-top-2 left-1/2 -translate-x-1/2'
                            : side === 'bottom'
                            ? '-bottom-2 left-1/2 -translate-x-1/2'
                            : side === 'left'
                            ? 'top-1/2 -left-2 -translate-y-1/2'
                            : 'top-1/2 -right-2 -translate-y-1/2';

                        return (
                          <button
                            key={side}
                            type="button"
                            title={`Connect ${side.toUpperCase()} port`}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              if (connectionStart) {
                                completeConnection(boundary.id, side);
                              } else {
                                startConnectingFromPort(boundary.id, side, e);
                              }
                            }}
                            className={`absolute ${posClass} w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center z-20 ${
                              isPortActive
                                ? 'bg-amber-400 border-white scale-125 shadow-lg'
                                : connectionStart
                                ? 'bg-cyan-500 border-white opacity-90 hover:scale-125 animate-pulse'
                                : 'bg-blue-600 border-white opacity-0 group-hover:opacity-100 hover:scale-125 shadow-sm'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                          </button>
                        );
                      })}

                      {}
                      <div
                        className={`flex items-center justify-between px-3 py-1.5 rounded-t-lg border-b transition-colors ${
                          isDark
                            ? 'bg-slate-900/80 border-slate-700/60 text-slate-100'
                            : 'bg-white/90 border-slate-300 text-slate-900 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {disp.showIcon !== false && (
                            <div className="p-1 rounded bg-black/20 shrink-0 flex items-center justify-center">
                              <LikeC4Icon
                                iconId={boundary.iconId}
                                fallbackIcon={Cloud}
                                className="w-3.5 h-3.5"
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold truncate">{boundary.name}</span>
                              {disp.showType !== false && (
                                <span className="text-[9px] font-mono px-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                  {boundary.type}
                                </span>
                              )}
                            </div>
                            {disp.showTitle !== false && boundary.title && (
                              <div className="text-[10px] text-slate-400 truncate leading-tight">
                                {boundary.title}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                              isDark
                                ? 'bg-slate-800 text-slate-300 border-slate-700'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {childrenCount} enclosed
                          </span>

                          <button
                            onClick={(e) => toggleElementEnabled(boundary.id, e)}
                            title={isMuted ? 'Enable Boundary' : 'Disable Boundary'}
                            className={`p-1 rounded transition ${
                              isMuted
                                ? 'bg-slate-700 text-slate-400'
                                : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            <Power className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Boundary description and tags */}
                      {disp.showDescription !== false && boundary.description && (
                        <div className="p-2 text-[10px] opacity-75 italic text-slate-400 line-clamp-1 pointer-events-none">
                          {boundary.description}
                        </div>
                      )}

                      {disp.showTags !== false && (boundary.tags || []).length > 0 && (
                        <div className="px-2.5 pb-1 flex flex-wrap gap-1 pointer-events-none">
                          {boundary.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-blue-900/40 text-blue-300 border border-blue-600/40"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, boundary.id)}
                        title="Drag to resize boundary"
                        className="absolute bottom-1 right-1 w-5 h-5 rounded cursor-se-resize flex items-center justify-center text-slate-400 hover:text-amber-400 opacity-60 hover:opacity-100 transition z-20"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: '0 0',
                  zIndex: 2
                }}
              >
                <defs>
                  <marker
                    id="rel-arrow"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill={isDark ? '#38BDF8' : '#0284C7'} />
                  </marker>
                  <marker
                    id="rel-arrow-selected"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B" />
                  </marker>
                  <marker
                    id="rel-arrow-dynamic"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="8"
                    markerHeight="8"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B" />
                  </marker>
                </defs>

                {/* If in Dynamic Flow view, render dynamic steps as sequenced links */}
                {isDynamicOrUseCase ? (
                  dynamicSteps.map((step, idx) => {
                    const src = model.elements[step.sourceId];
                    const tgt = model.elements[step.targetId];
                    if (!src || !tgt) return null;

                    const isCurrent = idx === activeStepIndex;
                    const srcPort = getPortPosition(src, 'auto', tgt);
                    const tgtPort = getPortPosition(tgt, 'auto', src);
                    const pathInfo = computeConnectorPath(srcPort, tgtPort, 'orthogonal');

                    return (
                      <g
                        key={step.id || idx}
                        onClick={() => setActiveStepIndex(idx)}
                        className="pointer-events-auto cursor-pointer group"
                      >
                        <path
                          d={pathInfo.d}
                          fill="none"
                          stroke="transparent"
                          strokeWidth="20"
                        />
                        <path
                          d={pathInfo.d}
                          fill="none"
                          stroke={isCurrent ? '#F59E0B' : isDark ? '#475569' : '#94A3B8'}
                          strokeWidth={isCurrent ? '4' : '2'}
                          strokeDasharray={isCurrent ? '6,3' : '4,4'}
                          markerEnd="url(#rel-arrow-dynamic)"
                          className={isCurrent ? 'animate-pulse' : ''}
                        />

                        {/* Sequenced Badge */}
                        <foreignObject
                          x={pathInfo.midX - 100}
                          y={pathInfo.midY - 18}
                          width="200"
                          height="42"
                          className="overflow-visible pointer-events-none"
                        >
                          <div
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] shadow-lg backdrop-blur mx-auto w-fit transition-all ${
                              isCurrent
                                ? 'bg-amber-500 text-slate-950 font-bold border-white ring-4 ring-amber-400/40 scale-105'
                                : isDark
                                ? 'bg-slate-900/90 border-slate-700 text-slate-300'
                                : 'bg-white border-slate-300 text-slate-700'
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[9px] font-bold">
                              {idx + 1}
                            </span>
                            <span className="truncate max-w-[130px] font-semibold">{step.title}</span>
                          </div>
                        </foreignObject>
                      </g>
                    );
                  })
                ) : (
                  Object.values(model.relationships).map((rel) => {
                    const src = model.elements[rel.sourceId];
                    const tgt = model.elements[rel.targetId];
                    if (!src || !tgt) return null;

                    const isMuted = src.enabled === false || tgt.enabled === false;
                    const srcPort = getPortPosition(src, rel.sourceHandle || 'auto', tgt);
                    const tgtPort = getPortPosition(tgt, rel.targetHandle || 'auto', src);

                    const routingType = rel.routing || defaultConnectorType || 'orthogonal';
                    const pathInfo = computeConnectorPath(srcPort, tgtPort, routingType);

                    const isSelected = selectedRelId === rel.id;
                    const midX = pathInfo.midX;
                    const midY = pathInfo.midY;

                    return (
                      <g
                        key={rel.id}
                        className="pointer-events-auto cursor-pointer group"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRelId(rel.id);
                          setSelectedElementId(null);
                          setIsRightPanelOpen(true);
                        }}
                        opacity={isMuted ? 0.35 : 1}
                      >
                        <path
                          d={pathInfo.d}
                          fill="none"
                          stroke="transparent"
                          strokeWidth="18"
                        />
                        <path
                          d={pathInfo.d}
                          fill="none"
                          stroke={
                            isSelected ? '#F59E0B' : isMuted ? '#64748B' : isDark ? '#38BDF8' : '#0284C7'
                          }
                          strokeWidth={isSelected ? '3.5' : '2'}
                          strokeDasharray={isSelected ? 'none' : isMuted ? '3,3' : '5,4'}
                          markerEnd={isSelected ? 'url(#rel-arrow-selected)' : 'url(#rel-arrow)'}
                          className="transition-all"
                        />

                        <circle cx={srcPort.x} cy={srcPort.y} r="3" fill={isSelected ? '#F59E0B' : isDark ? '#38BDF8' : '#0284C7'} />
                        <circle cx={tgtPort.x} cy={tgtPort.y} r="3" fill={isSelected ? '#F59E0B' : isDark ? '#38BDF8' : '#0284C7'} />

                        <foreignObject
                          x={midX - 90}
                          y={midY - 16}
                          width="180"
                          height="38"
                          className="overflow-visible pointer-events-none"
                        >
                          <div
                            className={`flex flex-col items-center justify-center px-2 py-0.5 rounded-md border text-[10px] text-center shadow-md backdrop-blur transition-all ${
                              isSelected
                                ? isDark
                                ? 'bg-amber-950/90 border-amber-500 text-amber-200 ring-2 ring-amber-500/30'
                                : 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-400/40'
                                : isDark
                                ? 'bg-slate-900/90 border-slate-700 text-slate-200 group-hover:border-slate-500'
                                : 'bg-white/95 border-slate-300 text-slate-800 group-hover:border-slate-400 shadow-2xs'
                            }`}
                          >
                            <span className="font-semibold truncate max-w-[160px] leading-tight">
                              {rel.title || 'interacts'}
                            </span>
                            {rel.technology && (
                              <span
                                className={`text-[9px] font-mono leading-none ${
                                  isDark ? 'text-cyan-400/90' : 'text-blue-600'
                                }`}
                              >
                                [{rel.technology}]
                              </span>
                            )}
                          </div>
                        </foreignObject>
                      </g>
                    );
                  })
                )}
              </svg>

              {/* LAYER 3: REGULAR NODES */}
              <div
                className="absolute inset-0 origin-top-left pointer-events-none"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  zIndex: 3
                }}
              >
                {}
                {regularElements.map((elem) => {
                  const arch =
                    ELEMENT_ARCHETYPES[elem.archetypeKey] || ELEMENT_ARCHETYPES.softwareSystem;
                  const Icon = arch.icon;
                  const isSelected = selectedElementId === elem.id;
                  const isConnecting = connectingSourceId === elem.id;
                  const isMuted = elem.enabled === false;
                  const x = elem.position?.x || 0;
                  const y = elem.position?.y || 0;
                  const w = elem.width || 248;
                  const h = elem.height || 136;
                  const disp = elem.displayOptions || {};

                  const isStepParticipant =
                    isDynamicOrUseCase &&
                    currentStep &&
                    (currentStep.sourceId === elem.id || currentStep.targetId === elem.id);

                  const bgColor = elem.customColor || arch.color;
                  const borderColor = isSelected ? '#F59E0B' : (elem.customBorderColor || arch.border);
                  const textColor = elem.customTextColor || arch.textColor;
                  const baseOpacity = elem.opacity ?? 1;
                  const computedOpacity = isMuted
                    ? baseOpacity * 0.45
                    : isDynamicOrUseCase && !isStepParticipant
                    ? baseOpacity * 0.6
                    : baseOpacity;

                  return (
                    <div
                      key={elem.id}
                      onMouseDown={(e) => handleMouseDownNode(e, elem.id)}
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                        width: `${w}px`,
                        height: `${h}px`,
                        backgroundColor: bgColor,
                        borderColor: borderColor,
                        color: textColor,
                        opacity: computedOpacity
                      }}
                      className={`group absolute rounded-xl border-2 shadow-lg pointer-events-auto cursor-move select-none flex flex-col overflow-hidden transition-all ${
                        isSelected
                          ? 'ring-4 ring-amber-400/50 shadow-amber-500/25'
                          : isStepParticipant
                          ? 'ring-4 ring-amber-400 shadow-xl scale-102'
                          : 'hover:shadow-2xl'
                      } ${isConnecting ? 'ring-4 ring-cyan-400 animate-pulse' : ''} ${
                        isMuted ? 'grayscale-[50%] border-dashed' : ''
                      }`}
                    >
                      {/* Port connection buttons on all 4 sides */}
                      {['top', 'right', 'bottom', 'left'].map((side) => {
                        const isPortActive =
                          connectionStart?.elementId === elem.id && connectionStart?.handle === side;
                        const posClass =
                          side === 'top'
                            ? '-top-2 left-1/2 -translate-x-1/2'
                            : side === 'bottom'
                            ? '-bottom-2 left-1/2 -translate-x-1/2'
                            : side === 'left'
                            ? 'top-1/2 -left-2 -translate-y-1/2'
                            : 'top-1/2 -right-2 -translate-y-1/2';

                        return (
                          <button
                            key={side}
                            type="button"
                            title={`Connect ${side.toUpperCase()} port`}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              if (connectionStart) {
                                completeConnection(elem.id, side);
                              } else {
                                startConnectingFromPort(elem.id, side, e);
                              }
                            }}
                            className={`absolute ${posClass} w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center z-30 ${
                              isPortActive
                                ? 'bg-amber-400 border-white scale-125 shadow-lg ring-2 ring-amber-300'
                                : connectionStart
                                ? 'bg-cyan-500 border-white opacity-95 hover:scale-125 animate-pulse ring-2 ring-cyan-300'
                                : 'bg-slate-900 border-white opacity-0 group-hover:opacity-100 hover:scale-125 shadow-sm'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                          </button>
                        );
                      })}

                      {/* Header bar */}
                      <div className="shrink-0 h-7 flex items-center justify-between px-3 pt-1.5 pb-1 border-b border-black/10">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {disp.showType !== false && (
                            <span className="text-[9px] font-mono tracking-wider uppercase opacity-75 font-semibold truncate">
                              [{arch.label || elem.type}]
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            title={isMuted ? 'Enable Element' : 'Disable Element'}
                            onClick={(e) => toggleElementEnabled(elem.id, e)}
                            className={`p-1 rounded transition ${
                              isMuted ? 'text-red-300 hover:text-red-200' : 'text-white/60 hover:text-emerald-300'
                            }`}
                          >
                            <Power className="w-3 h-3" />
                          </button>
                          <button
                            title="Connect from Auto Port"
                            onClick={(e) => startConnecting(elem.id, e)}
                            className={`p-1 rounded transition ${
                              isConnecting ? 'text-amber-300' : 'text-white/60 hover:text-white'
                            }`}
                          >
                            <Share2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Node Body with Stable-Height Anchor for Icon */}
                      <div className="flex-1 min-h-0 relative flex items-center px-3.5 py-1.5 gap-3 min-w-0 overflow-hidden">
                        {disp.showIcon !== false && (
                          <div className="shrink-0 w-12 h-full flex items-center justify-center -translate-y-1.5 pointer-events-none">
                            <LikeC4Icon
                              iconId={elem.iconId}
                              fallbackIcon={Icon}
                              className="w-12 h-12 drop-shadow-sm"
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0 max-h-full flex flex-col justify-center text-left gap-0.5 overflow-hidden">
                          <div className="shrink-0 text-left font-bold text-[12.5px] leading-tight text-white tracking-tight truncate drop-shadow-xs">
                            {elem.name}
                          </div>

                          {disp.showTitle !== false && elem.title && (
                            <div className="shrink-0 text-left text-[10px] text-white/80 italic leading-tight truncate">
                              {elem.title}
                            </div>
                          )}

                          {disp.showDescription !== false && elem.description && (
                            <div className="text-left text-[10px] font-normal leading-[13px] text-white/85 line-clamp-2 overflow-hidden">
                              {elem.description}
                            </div>
                          )}

                          {disp.showTechnology !== false && elem.technology && (
                            <div className="shrink-0 text-left pt-0.5">
                              <span className="inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/25 text-white/85 leading-none truncate max-w-full">
                                [{elem.technology}]
                              </span>
                            </div>
                          )}

                          {disp.showTags !== false && (elem.tags || []).length > 0 && (
                            <div className="shrink-0 pt-0.5 flex flex-wrap items-center justify-start gap-1">
                              {elem.tags.slice(0, 3).map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[8px] font-mono px-1 py-0.2 rounded bg-black/20 text-white/70 leading-none"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Resize Handle */}
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, elem.id)}
                        title="Drag to resize node"
                        className="absolute bottom-1 right-1 w-4 h-4 cursor-se-resize flex items-center justify-center text-white/40 hover:text-amber-300 opacity-40 hover:opacity-100 transition z-20"
                      >
                        <CornerDownRight className="w-3 h-3" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Floating Controls */}
              <div
                className={`absolute bottom-4 left-4 flex items-center gap-1.5 p-1 rounded-lg border shadow-lg z-10 text-xs backdrop-blur transition-colors ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800 text-slate-300'
                    : 'bg-white/95 border-slate-200 text-slate-700 shadow-md'
                }`}
              >
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.1, 2.5))}
                  className={`p-1.5 rounded transition ${
                    isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100 text-slate-800'
                  }`}
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.1, 0.3))}
                  className={`p-1.5 rounded transition ${
                    isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100 text-slate-800'
                  }`}
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 30, y: 30 });
                  }}
                  className={`px-2 py-1 rounded font-mono text-[11px] transition ${
                    isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-800'
                  }`}
                  title="Reset View"
                >
                  {Math.round(zoom * 100)}%
                </button>

                <div className={`h-4 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-300'} mx-0.5`} />

                <div className="flex items-center gap-0.5 bg-black/15 p-0.5 rounded">
                  {Object.values(CONNECTOR_TYPES).map((conn) => {
                    const ConnIcon = conn.icon;
                    const isDefault = defaultConnectorType === conn.id;
                    return (
                      <button
                        key={conn.id}
                        type="button"
                        onClick={() => {
                          setDefaultConnectorType(conn.id);
                          showToast(`Default connector: ${conn.label}`);
                        }}
                        title={`Default: ${conn.label} - ${conn.desc}`}
                        className={`p-1 rounded flex items-center gap-1 text-[11px] font-medium transition ${
                          isDefault
                            ? 'bg-blue-600 text-white shadow-xs'
                            : isDark
                            ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        }`}
                      >
                        <ConnIcon className="w-3.5 h-3.5" />
                      </button>
                    );
                  })}
                </div>

                <div className={`h-4 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-300'} mx-0.5`} />

                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-1.5 rounded transition ${
                    showGrid
                      ? isDark
                        ? 'bg-blue-600/30 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                      : isDark
                      ? 'text-slate-400 hover:bg-slate-800'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                  title="Toggle Grid"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`flex-1 flex flex-col p-4 font-mono text-xs overflow-hidden transition-colors ${
                isDark ? 'bg-slate-950 text-slate-200' : 'bg-slate-100 text-slate-800'
              }`}
            >
              <div
                className={`flex items-center justify-between pb-3 border-b mb-3 ${
                  isDark ? 'border-slate-800' : 'border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-500" />
                  <span className="font-bold text-sm">architecture.c4</span>
                  <span className={`text-[11px] font-sans ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    (Synchronized with dynamic flows, boundaries, and nested layers)
                  </span>
                </div>
                <div className="flex items-center gap-2 font-sans">
                  <button
                    onClick={() => copyToClipboard(Serializers.toLikeC4(model))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs'
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy DSL</span>
                  </button>
                  <button
                    onClick={() =>
                      downloadFile('architecture.c4', Serializers.toLikeC4(model), 'text/plain')
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .c4</span>
                  </button>
                </div>
              </div>

              <div
                className={`flex-1 overflow-auto rounded-lg border p-4 shadow-inner ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <pre
                  className={`leading-relaxed font-mono ${
                    isDark ? 'text-blue-300' : 'text-blue-900 font-medium'
                  }`}
                >
                  {Serializers.toLikeC4(model)}
                </pre>
              </div>
            </div>
          )}
        </main>

        {/* Resizer Right */}
        {}
        {isRightPanelOpen && (
          <div
            onMouseDown={startResizeRight}
            className={`w-1.5 hover:w-2 hover:bg-blue-500 cursor-col-resize z-20 flex items-center justify-center transition-colors group ${
              isDark ? 'bg-slate-800 hover:bg-blue-500' : 'bg-slate-200 hover:bg-blue-500'
            }`}
            title="Drag to resize inspector"
          >
            <div className="w-0.5 h-6 bg-slate-400 rounded-full group-hover:bg-white" />
          </div>
        )}

        {}
        {}
        {isRightPanelOpen && (
          <aside
            style={{ width: `${rightPanelWidth}px` }}
            className={`shrink-0 border-l flex flex-col z-10 transition-colors ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div
              className={`p-3 border-b flex items-center justify-between ${
                isDark ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
                <span>
                  {activeElement?.isBoundary
                    ? 'Boundary Inspector'
                    : activeElement
                    ? 'Node Properties'
                    : activeRel
                    ? 'Connector Inspector'
                    : isDynamicOrUseCase
                    ? 'Dynamic Steps'
                    : 'Properties'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {activeElement && (
                  <button
                    onClick={deleteSelectedElement}
                    className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-500/10 transition"
                    title="Delete Selected"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {activeRel && (
                  <button
                    onClick={deleteSelectedRelationship}
                    className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-500/10 transition"
                    title="Delete Relationship"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsRightPanelOpen(false)}
                  className={`p-1 rounded transition ${
                    isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Close parameter panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-4 text-xs">
              {activeElement ? (
                activeElement.isBoundary ? (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs">{activeElement.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                          Boundary
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateSelectedElement({
                            enabled: activeElement.enabled === false
                          })
                        }
                        className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${
                          activeElement.enabled !== false
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-red-600 hover:bg-red-500 text-white'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{activeElement.enabled !== false ? 'Disable' : 'Enable'}</span>
                      </button>
                    </div>

                    <div>
                      <label className={`text-[11px] font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Boundary Name
                      </label>
                      <input
                        type="text"
                        value={activeElement.name}
                        onChange={(e) => updateSelectedElement({ name: e.target.value })}
                        className={`w-full px-2.5 py-1.5 rounded-md border focus:outline-hidden focus:border-blue-500 transition ${
                          isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`text-[10px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Fill Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activeElement.boundaryStyle?.fillColor || '#1E293B'}
                            onChange={(e) =>
                              updateSelectedElement({
                                boundaryStyle: {
                                  ...(activeElement.boundaryStyle || {}),
                                  fillColor: e.target.value
                                }
                              })
                            }
                            className="w-7 h-7 rounded border cursor-pointer p-0.5 bg-transparent"
                          />
                          <span className="font-mono text-[10px] uppercase">
                            {activeElement.boundaryStyle?.fillColor || '#1E293B'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className={`text-[10px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Border Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activeElement.boundaryStyle?.borderColor || '#3B82F6'}
                            onChange={(e) =>
                              updateSelectedElement({
                                boundaryStyle: {
                                  ...(activeElement.boundaryStyle || {}),
                                  borderColor: e.target.value
                                }
                              })
                            }
                            className="w-7 h-7 rounded border cursor-pointer p-0.5 bg-transparent"
                          />
                          <span className="font-mono text-[10px] uppercase">
                            {activeElement.boundaryStyle?.borderColor || '#3B82F6'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Swatches */}
                    <div>
                      <label className={`text-[10px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Quick Swatches
                      </label>
                      <div className="flex items-center gap-1 flex-wrap">
                        {PRESET_SWATCHES.map((swatch) => (
                          <button
                            key={swatch}
                            type="button"
                            onClick={() =>
                              updateSelectedElement({
                                boundaryStyle: {
                                  ...(activeElement.boundaryStyle || {}),
                                  borderColor: swatch,
                                  fillColor: swatch
                                }
                              })
                            }
                            style={{ backgroundColor: swatch }}
                            className="w-5 h-5 rounded-md border border-white/30 hover:scale-115 transition-transform"
                            title={`Select color ${swatch}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Transparency slider */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Body Fill Opacity (Internal Transparency)
                        </label>
                        <span className="font-mono text-[10px] font-bold text-blue-400">
                          {Math.round(
                            (activeElement.boundaryStyle?.fillOpacity !== undefined
                              ? activeElement.boundaryStyle.fillOpacity
                              : (activeElement.opacity !== undefined && activeElement.opacity <= 1
                                ? activeElement.opacity
                                : 0.12)) * 100
                          )}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.02"
                        value={
                          activeElement.boundaryStyle?.fillOpacity !== undefined
                            ? activeElement.boundaryStyle.fillOpacity
                            : (activeElement.opacity !== undefined && activeElement.opacity <= 1
                              ? activeElement.opacity
                              : 0.12)
                        }
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          updateSelectedElement({
                            boundaryStyle: {
                              ...(activeElement.boundaryStyle || {}),
                              fillOpacity: val
                            }
                          });
                        }}
                        className="w-full cursor-pointer accent-blue-500"
                      />
                    </div>

                    {/* Border style */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`text-[10px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Border Style
                        </label>
                        <select
                          value={activeElement.boundaryStyle?.borderStyle || 'dashed'}
                          onChange={(e) =>
                            updateSelectedElement({
                              boundaryStyle: {
                                ...(activeElement.boundaryStyle || {}),
                                borderStyle: e.target.value
                              }
                            })
                          }
                          className={`w-full px-2 py-1 rounded text-[11px] border ${
                            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        >
                          <option value="dashed">Dashed</option>
                          <option value="solid">Solid</option>
                          <option value="dotted">Dotted</option>
                        </select>
                      </div>

                      <div>
                        <label className={`text-[10px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Stroke: {activeElement.boundaryStyle?.borderWidth || 2}px
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="6"
                          step="1"
                          value={activeElement.boundaryStyle?.borderWidth || 2}
                          onChange={(e) =>
                            updateSelectedElement({
                              boundaryStyle: {
                                ...(activeElement.boundaryStyle || {}),
                                borderWidth: parseInt(e.target.value, 10)
                              }
                            })
                          }
                          className="w-full cursor-pointer accent-blue-500"
                        />
                      </div>
                    </div>

                    {/* Boundary Display Toggles */}
                    <div className={`p-2.5 rounded-lg border space-y-2 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-500">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Boundary Display Toggles</span>
                      </div>

                      <div className="space-y-1.5">
                        {[
                          { key: 'showTitle', label: 'Show Title / Subtitle' },
                          { key: 'showDescription', label: 'Show Description' },
                          { key: 'showType', label: 'Show Type Badge' },
                          { key: 'showIcon', label: 'Show Icon' },
                          { key: 'showTags', label: 'Show Tags' }
                        ].map((item) => {
                          const isShown = activeElement.displayOptions?.[item.key] !== false;
                          return (
                            <div
                              key={item.key}
                              onClick={() =>
                                updateSelectedElement({
                                  displayOptions: {
                                    ...(activeElement.displayOptions || {}),
                                    [item.key]: !isShown
                                  }
                                })
                              }
                              className={`flex items-center justify-between p-1.5 rounded-md border cursor-pointer transition ${
                                isShown
                                  ? isDark
                                    ? 'bg-blue-950/40 border-blue-800 text-blue-200'
                                    : 'bg-blue-50 border-blue-200 text-blue-900 font-medium'
                                  : isDark
                                  ? 'bg-slate-900/60 border-slate-800 text-slate-500'
                                  : 'bg-slate-100 border-slate-200 text-slate-400'
                              }`}
                            >
                              <span className="text-[11px]">{item.label}</span>
                              {isShown ? (
                                <Eye className="w-3.5 h-3.5 text-blue-500" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
              ) : (
                /* REGULAR NODE PROPERTIES */
                <div className="space-y-3.5">
                  <div>
                    <label className={`text-[11px] font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Element Name
                    </label>
                    <input
                      type="text"
                      value={activeElement.name}
                      onChange={(e) => updateSelectedElement({ name: e.target.value })}
                      className={`w-full px-2.5 py-1.5 rounded-md border focus:outline-hidden focus:border-blue-500 transition ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-[11px] font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Subtitle / Title
                    </label>
                    <input
                      type="text"
                      value={activeElement.title || ''}
                      onChange={(e) => updateSelectedElement({ title: e.target.value })}
                      placeholder="e.g. Single-Page Application"
                      className={`w-full px-2.5 py-1.5 rounded-md border focus:outline-hidden focus:border-blue-500 transition ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-[11px] font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Description
                    </label>
                    <textarea
                      rows="2"
                      value={activeElement.description || ''}
                      onChange={(e) => updateSelectedElement({ description: e.target.value })}
                      placeholder="Brief overview of component responsibilities..."
                      className={`w-full px-2.5 py-1.5 rounded-md border focus:outline-hidden focus:border-blue-500 transition resize-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-[11px] font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Technology Stack
                    </label>
                    <input
                      type="text"
                      value={activeElement.technology || ''}
                      onChange={(e) => updateSelectedElement({ technology: e.target.value })}
                      placeholder="e.g. React 19, TypeScript"
                      className={`w-full px-2.5 py-1.5 rounded-md border focus:outline-hidden focus:border-blue-500 font-mono text-[11px] transition ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {}
                  <div className={`p-2.5 rounded-lg border space-y-2.5 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-500">
                      <Palette className="w-3.5 h-3.5" />
                      <span>Node Color & Transparency</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className={`text-[9px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Background
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="color"
                            value={activeElement.customColor || ELEMENT_ARCHETYPES[activeElement.archetypeKey]?.color || '#1168BD'}
                            onChange={(e) => updateSelectedElement({ customColor: e.target.value })}
                            className="w-6 h-6 rounded border cursor-pointer p-0.5 bg-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`text-[9px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Border
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="color"
                            value={activeElement.customBorderColor || ELEMENT_ARCHETYPES[activeElement.archetypeKey]?.border || '#0B4884'}
                            onChange={(e) => updateSelectedElement({ customBorderColor: e.target.value })}
                            className="w-6 h-6 rounded border cursor-pointer p-0.5 bg-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`text-[9px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Text Color
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="color"
                            value={activeElement.customTextColor || '#FFFFFF'}
                            onChange={(e) => updateSelectedElement({ customTextColor: e.target.value })}
                            className="w-6 h-6 rounded border cursor-pointer p-0.5 bg-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Color Swatches */}
                    <div>
                      <label className={`text-[9px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Color Palettes
                      </label>
                      <div className="flex items-center gap-1 flex-wrap">
                        {PRESET_SWATCHES.map((swatch) => (
                          <button
                            key={swatch}
                            type="button"
                            onClick={() =>
                              updateSelectedElement({
                                customColor: swatch,
                                customBorderColor: swatch
                              })
                            }
                            style={{ backgroundColor: swatch }}
                            className="w-4 h-4 rounded-md border border-white/20 hover:scale-125 transition-transform"
                            title={`Select ${swatch}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Opacity slider */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Transparency / Opacity
                        </label>
                        <span className="font-mono text-[10px] font-bold text-blue-400">
                          {Math.round((activeElement.opacity ?? 1) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={activeElement.opacity ?? 1}
                        onChange={(e) => updateSelectedElement({ opacity: parseFloat(e.target.value) })}
                        className="w-full cursor-pointer accent-blue-500"
                      />
                    </div>
                  </div>

                  {}
                  <div className={`p-2.5 rounded-lg border space-y-2 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-500">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Node Display & Visibility</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { key: 'showTitle', label: 'Subtitle / Title' },
                        { key: 'showDescription', label: 'Description' },
                        { key: 'showTechnology', label: 'Technology Stack' },
                        { key: 'showIcon', label: 'Bundled Icon' },
                        { key: 'showType', label: 'Type Tag' },
                        { key: 'showTags', label: 'Tags' }
                      ].map((item) => {
                        const isShown = activeElement.displayOptions?.[item.key] !== false;
                        return (
                          <div
                            key={item.key}
                            onClick={() =>
                              updateSelectedElement({
                                displayOptions: {
                                  ...(activeElement.displayOptions || {}),
                                  [item.key]: !isShown
                                }
                              })
                            }
                            className={`flex items-center justify-between p-1.5 rounded-md border cursor-pointer transition ${
                              isShown
                                ? isDark
                                  ? 'bg-blue-950/40 border-blue-800 text-blue-200'
                                  : 'bg-blue-50 border-blue-200 text-blue-900 font-medium'
                                : isDark
                                ? 'bg-slate-900/60 border-slate-800 text-slate-500'
                                : 'bg-slate-100 border-slate-200 text-slate-400'
                            }`}
                          >
                            <span className="text-[11px] truncate">{item.label}</span>
                            {isShown ? (
                              <Eye className="w-3 h-3 text-blue-500 shrink-0" />
                            ) : (
                              <EyeOff className="w-3 h-3 text-slate-400 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tags Editor */}
                  <div>
                    <label className={`text-[11px] font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Tags (Comma or Enter separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. backend, core, financial"
                      value={(activeElement.tags || []).join(', ')}
                      onChange={(e) => {
                        const val = e.target.value;
                        const newTags = val
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean);
                        updateSelectedElement({ tags: newTags });
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-md border focus:outline-hidden focus:border-blue-500 font-mono text-[11px] transition ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              )
            ) : activeRel ? (
              /* CONNECTOR INSPECTOR */
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs truncate">Connector Properties</span>
                    <button
                      type="button"
                      onClick={deleteSelectedRelationship}
                      className="text-red-500 hover:text-red-400 p-1 rounded"
                      title="Delete connector"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className={`text-[11px] font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Relationship Label
                    </label>
                    <input
                      type="text"
                      value={activeRel.title || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setModel((prev) => ({
                          ...prev,
                          relationships: {
                            ...prev.relationships,
                            [activeRel.id]: { ...activeRel, title: val }
                          }
                        }));
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-md border focus:outline-hidden focus:border-blue-500 text-xs transition ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-[11px] font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Technology / Protocol
                    </label>
                    <input
                      type="text"
                      value={activeRel.technology || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setModel((prev) => ({
                          ...prev,
                          relationships: {
                            ...prev.relationships,
                            [activeRel.id]: { ...activeRel, technology: val }
                          }
                        }));
                      }}
                      placeholder="e.g. HTTPS, gRPC, PostgreSQL"
                      className={`w-full px-2.5 py-1.5 rounded-md border font-mono focus:outline-hidden focus:border-blue-500 text-xs transition ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-[11px] font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Routing Style
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {Object.values(CONNECTOR_TYPES).map((conn) => {
                        const IconComp = conn.icon;
                        const isSelected = (activeRel.routing || 'orthogonal') === conn.id;
                        return (
                          <button
                            key={conn.id}
                            type="button"
                            onClick={() => {
                              setModel((prev) => ({
                                ...prev,
                                relationships: {
                                  ...prev.relationships,
                                  [activeRel.id]: { ...activeRel, routing: conn.id }
                                }
                              }));
                            }}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                                : isDark
                                ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <IconComp className="w-4 h-4 mb-1" />
                            <span className="text-[10px] font-medium">{conn.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={`text-[10px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Source Handle
                      </label>
                      <select
                        value={activeRel.sourceHandle || 'auto'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setModel((prev) => ({
                            ...prev,
                            relationships: {
                              ...prev.relationships,
                              [activeRel.id]: { ...activeRel, sourceHandle: val }
                            }
                          }));
                        }}
                        className={`w-full px-2 py-1 rounded text-xs border ${
                          isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                        }`}
                      >
                        {PORT_POSITIONS.map((p) => (
                          <option key={p} value={p}>
                            {p.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`text-[10px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Target Handle
                      </label>
                      <select
                        value={activeRel.targetHandle || 'auto'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setModel((prev) => ({
                            ...prev,
                            relationships: {
                              ...prev.relationships,
                              [activeRel.id]: { ...activeRel, targetHandle: val }
                            }
                          }));
                        }}
                        className={`w-full px-2 py-1 rounded text-xs border ${
                          isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                        }`}
                      >
                        {PORT_POSITIONS.map((p) => (
                          <option key={p} value={p}>
                            {p.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 space-y-1">
                  <Info className="w-5 h-5 mx-auto mb-2 opacity-40" />
                  <p className="font-medium text-xs">No Element Selected</p>
                  <p className="text-[11px] opacity-75">
                    Click any node, boundary or connector to inspect its properties.
                  </p>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

    {/* MODALS */}
    {showAddArchetypeModal && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div
          className={`w-full max-w-lg border rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div
            className={`p-4 border-b flex items-center justify-between ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Create Component Archetype
                </h3>
                <p className="text-[10px] text-slate-400">
                  Define a reusable architectural building block for your palette
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddArchetypeModal(false)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddArchetype} className="p-4 space-y-3.5 text-xs overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Archetype Name / Label *
                </label>
                <input
                  type="text"
                  required
                  value={newArchetypeForm.label}
                  onChange={(e) => setNewArchetypeForm({ ...newArchetypeForm, label: e.target.value })}
                  placeholder="e.g. GraphQL Gateway, Redis Cache"
                  className={`w-full px-2.5 py-1.5 rounded-md border text-xs focus:outline-hidden focus:border-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Category Group
                </label>
                <select
                  value={newArchetypeForm.category}
                  onChange={(e) => setNewArchetypeForm({ ...newArchetypeForm, category: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-md border text-xs focus:outline-hidden focus:border-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Compute & Routing">Compute & Routing</option>
                  <option value="Data & Queues">Data & Queues</option>
                  <option value="Clients & Apps">Clients & Apps</option>
                  <option value="Actors & Systems">Actors & Systems</option>
                  <option value="Boundaries & Enclosures">Boundaries & Enclosures</option>
                  <option value="__custom__">+ Custom Category...</option>
                </select>
              </div>
            </div>

            {newArchetypeForm.category === '__custom__' && (
              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Custom Category Name
                </label>
                <input
                  type="text"
                  required
                  value={newArchetypeForm.customCategory}
                  onChange={(e) => setNewArchetypeForm({ ...newArchetypeForm, customCategory: e.target.value })}
                  placeholder="e.g. AI & Machine Learning, Security Perimeter"
                  className={`w-full px-2.5 py-1.5 rounded-md border text-xs focus:outline-hidden focus:border-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  C4 Architectural Type
                </label>
                <select
                  value={newArchetypeForm.c4Type}
                  onChange={(e) => setNewArchetypeForm({ ...newArchetypeForm, c4Type: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-md border text-xs focus:outline-hidden focus:border-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="container">Container (Service / DB / App)</option>
                  <option value="component">Component (Internal module)</option>
                  <option value="softwareSystem">Software System</option>
                  <option value="person">Person / Actor</option>
                  <option value="deploymentNode">Deployment Node</option>
                </select>
              </div>

              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Node Nature
                </label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newArchetypeForm.isBoundary}
                    onChange={(e) => setNewArchetypeForm({ ...newArchetypeForm, isBoundary: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span className="text-xs font-medium">Is Grouping Boundary?</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Default Technology Stack
                </label>
                <input
                  type="text"
                  value={newArchetypeForm.defaultTech}
                  onChange={(e) => setNewArchetypeForm({ ...newArchetypeForm, defaultTech: e.target.value })}
                  placeholder="e.g. Apollo GraphQL / Node.js"
                  className={`w-full px-2.5 py-1.5 rounded-md border text-xs focus:outline-hidden focus:border-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Description
                </label>
                <input
                  type="text"
                  value={newArchetypeForm.desc}
                  onChange={(e) => setNewArchetypeForm({ ...newArchetypeForm, desc: e.target.value })}
                  placeholder="e.g. Handles queries and mutations"
                  className={`w-full px-2.5 py-1.5 rounded-md border text-xs focus:outline-hidden focus:border-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Bundled Icon Picker */}
            <div>
              <label className={`block font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Associated Bundled Icon
              </label>
              <div className="grid grid-cols-6 gap-1.5 max-h-32 overflow-y-auto p-1.5 border rounded-lg bg-black/10">
                {Object.values(LIKEC4_BUNDLED_ICONS).map((iconObj) => {
                  const isSelected = newArchetypeForm.iconId === iconObj.id;
                  return (
                    <button
                      key={iconObj.id}
                      type="button"
                      onClick={() => setNewArchetypeForm({ ...newArchetypeForm, iconId: iconObj.id })}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition ${
                        isSelected
                          ? 'bg-blue-600/30 border-blue-500 ring-2 ring-blue-500/40'
                          : isDark
                          ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                      title={iconObj.label}
                    >
                      {iconObj.render('w-5 h-5 mb-1')}
                      <span className="text-[9px] font-mono truncate w-full">{iconObj.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors & Palette Swatches */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Background
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={newArchetypeForm.color}
                    onChange={(e) => setNewArchetypeForm({ ...newArchetypeForm, color: e.target.value })}
                    className="w-7 h-7 rounded border cursor-pointer p-0.5 bg-transparent"
                  />
                  <span className="font-mono text-[10px] uppercase">{newArchetypeForm.color}</span>
                </div>
              </div>

              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Border
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={newArchetypeForm.border}
                    onChange={(e) => setNewArchetypeForm({ ...newArchetypeForm, border: e.target.value })}
                    className="w-7 h-7 rounded border cursor-pointer p-0.5 bg-transparent"
                  />
                  <span className="font-mono text-[10px] uppercase">{newArchetypeForm.border}</span>
                </div>
              </div>

              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Text Color
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={newArchetypeForm.textColor}
                    onChange={(e) => setNewArchetypeForm({ ...newArchetypeForm, textColor: e.target.value })}
                    className="w-7 h-7 rounded border cursor-pointer p-0.5 bg-transparent"
                  />
                  <span className="font-mono text-[10px] uppercase">{newArchetypeForm.textColor}</span>
                </div>
              </div>
            </div>

            {/* Quick Swatches */}
            <div>
              <label className={`block text-[10px] font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Quick Color Presets
              </label>
              <div className="flex items-center gap-1 flex-wrap">
                {PRESET_SWATCHES.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() =>
                      setNewArchetypeForm({
                        ...newArchetypeForm,
                        color: swatch,
                        border: swatch
                      })
                    }
                    style={{ backgroundColor: swatch }}
                    className="w-5 h-5 rounded-md border border-white/20 hover:scale-120 transition-transform"
                    title={`Select color ${swatch}`}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-700/30">
              <button
                type="button"
                onClick={() => setShowAddArchetypeModal(false)}
                className="px-3 py-1.5 rounded-md border text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-xs"
              >
                Add to Palette
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {showCreateViewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-md border rounded-xl shadow-2xl flex flex-col overflow-hidden transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div
              className={`p-4 border-b flex items-center justify-between ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-500" />
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Create LikeC4 View
                </h3>
              </div>
              <button
                onClick={() => setShowCreateViewModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateView} className="p-4 space-y-3 text-xs">
              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  View Type / Kind
                </label>
                <select
                  value={newViewForm.kind}
                  onChange={(e) => setNewViewForm({ ...newViewForm, kind: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-md border focus:outline-hidden focus:border-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="dynamic">Dynamic View (Interaction sequence)</option>
                  <option value="usecase">Use Case Scenario (End-to-end flow)</option>
                  <option value="container">Container View</option>
                  <option value="landscape">Landscape View</option>
                  <option value="context">System Context View</option>
                  <option value="component">Component View</option>
                  <option value="deployment">Deployment View</option>
                </select>
              </div>

              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  View Identifier (Unique ID)
                </label>
                <input
                  type="text"
                  required
                  value={newViewForm.id}
                  onChange={(e) => setNewViewForm({ ...newViewForm, id: e.target.value })}
                  placeholder="e.g. order_processing_flow"
                  className={`w-full px-2.5 py-1.5 rounded-md border font-mono focus:outline-hidden focus:border-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  View Title
                </label>
                <input
                  type="text"
                  value={newViewForm.title}
                  onChange={(e) => setNewViewForm({ ...newViewForm, title: e.target.value })}
                  placeholder="e.g. Customer Places Order Flow"
                  className={`w-full px-2.5 py-1.5 rounded-md border focus:outline-hidden focus:border-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateViewModal(false)}
                  className="px-3 py-1.5 rounded-md border text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-xs"
                >
                  Save View
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {showAddStepModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-md border rounded-xl shadow-2xl flex flex-col overflow-hidden transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div
              className={`p-4 border-b flex items-center justify-between ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-500" />
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Add Flow Step
                </h3>
              </div>
              <button
                onClick={() => setShowAddStepModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDynamicStep} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Source Entity
                  </label>
                  <select
                    value={newStepForm.sourceId}
                    onChange={(e) => setNewStepForm({ ...newStepForm, sourceId: e.target.value })}
                    className={`w-full px-2 py-1.5 rounded-md border ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {Object.values(model.elements)
                      .filter((el) => !el.isBoundary)
                      .map((el) => (
                        <option key={el.id} value={el.id}>
                          {el.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Target Entity
                  </label>
                  <select
                    value={newStepForm.targetId}
                    onChange={(e) => setNewStepForm({ ...newStepForm, targetId: e.target.value })}
                    className={`w-full px-2 py-1.5 rounded-md border ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {Object.values(model.elements)
                      .filter((el) => !el.isBoundary)
                      .map((el) => (
                        <option key={el.id} value={el.id}>
                          {el.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Step Message / Interaction Label
                </label>
                <input
                  type="text"
                  required
                  value={newStepForm.title}
                  onChange={(e) => setNewStepForm({ ...newStepForm, title: e.target.value })}
                  placeholder="e.g. Submits credit card payload"
                  className={`w-full px-2.5 py-1.5 rounded-md border ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Protocol / Technology
                </label>
                <input
                  type="text"
                  value={newStepForm.technology}
                  onChange={(e) => setNewStepForm({ ...newStepForm, technology: e.target.value })}
                  placeholder="e.g. HTTPS POST / TLS 1.3"
                  className={`w-full px-2.5 py-1.5 rounded-md border font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStepModal(false)}
                  className="px-3 py-1.5 rounded-md border text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-xs"
                >
                  Add Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-2xl border rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div
              className={`p-4 border-b flex items-center justify-between ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-500" />
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Universal Architecture Export Hub
                </h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'likec4', label: 'LikeC4 (.c4)', desc: 'Official DSL with dynamic views' },
                  { id: 'mermaid', label: 'Mermaid (.mmd)', desc: isDynamicOrUseCase ? 'Sequence Diagram' : 'C4 syntax' },
                  { id: 'drawio', label: 'Draw.io (.drawio)', desc: 'mxGraph XML for diagrams.net' },
                  { id: 'json', label: 'Model JSON', desc: 'Raw AST architecture graph' },
                  { id: 'svg', label: 'Vector (.svg)', desc: 'Resolution-independent vector' },
                  { id: 'png', label: 'Raster (.png)', desc: 'High resolution bitmap image' }
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setExportFormat(fmt.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      exportFormat === fmt.id
                        ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-xs'
                        : isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{fmt.label}</div>
                    <div className="text-[10px] mt-0.5 opacity-75">{fmt.desc}</div>
                  </button>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold">Output Preview</span>
                  {exportFormat !== 'png' && (
                    <button
                      onClick={() => copyToClipboard(exportContent)}
                      className="text-[11px] text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Code</span>
                    </button>
                  )}
                </div>
                <div
                  className={`border rounded-lg p-3 max-h-48 overflow-auto font-mono text-[11px] ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <pre>{exportContent}</pre>
                </div>
              </div>
            </div>

            <div
              className={`p-4 border-t flex items-center justify-end gap-2 ${
                isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium border text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={triggerExportDownload}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {exportFormat.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      <footer
        className={`h-8 flex items-center justify-between px-4 text-[11px] border-t backdrop-blur shrink-0 transition-colors ${
          isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-white/90 border-slate-200 text-slate-500'
        }`}
      >
        <div className="flex items-center gap-3 font-mono">
          <span>{Object.values(model.elements).filter(e=>e.enabled!==false).length} nodes</span>
          <span className="opacity-30">|</span>
          <span>{Object.values(model.relationships).length} connectors</span>
          <span className="opacity-30">|</span>
          <span>{Object.values(model.views).length} views</span>
        </div>
        <div className="font-medium tracking-tight"><a href="https://github.com/raghukr80" className="underline hover:text-blue-600 transition-colors">Idea & Design by raghukr80</a></div>
      </footer>

      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 text-xs px-3.5 py-2 rounded-lg shadow-xl flex items-center gap-2 z-50 animate-bounce border ${
            isDark ? 'bg-slate-800 border-blue-500/50 text-white' : 'bg-white border-blue-400 text-slate-800 shadow-lg'
          }`}
        >
          <Check className="w-4 h-4 text-emerald-500" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}