// Page Builder Types

export type BlockType =
  | "heading"
  | "paragraph"
  | "image"
  | "link"
  | "button"
  | "spacer"
  | "divider"
  | "video"
  | "code"
  | "quote"
  | "list"
  | "columns"
  | "card";

export interface BaseBlock {
  id: string;
  type: BlockType;
  order: number;
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
  style?: React.CSSProperties;
}

export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  content: string;
  style?: React.CSSProperties;
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  url: string;
  alt: string;
  width?: string;
  height?: string;
  alignment?: "left" | "center" | "right";
}

export interface LinkBlock extends BaseBlock {
  type: "link";
  text: string;
  url: string;
  openInNewTab?: boolean;
  style?: React.CSSProperties;
}

export interface ButtonBlock extends BaseBlock {
  type: "button";
  text: string;
  url: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  alignment?: "left" | "center" | "right";
}

export interface SpacerBlock extends BaseBlock {
  type: "spacer";
  height: string;
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
  style?: "solid" | "dashed" | "dotted";
  thickness?: string;
  color?: string;
}

export interface VideoBlock extends BaseBlock {
  type: "video";
  url: string;
  width?: string;
  height?: string;
  autoplay?: boolean;
  controls?: boolean;
}

export interface CodeBlock extends BaseBlock {
  type: "code";
  content: string;
  language?: string;
}

export interface QuoteBlock extends BaseBlock {
  type: "quote";
  content: string;
  author?: string;
  style?: React.CSSProperties;
}

export interface ListBlock extends BaseBlock {
  type: "list";
  items: string[];
  ordered?: boolean;
  style?: React.CSSProperties;
}

export interface ColumnsBlock extends BaseBlock {
  type: "columns";
  columns: PageBlock[][];
  columnCount: 2 | 3 | 4;
  gap?: string;
}

export interface CardBlock extends BaseBlock {
  type: "card";
  title?: string;
  content: string;
  style?: React.CSSProperties;
}

export type PageBlock =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | LinkBlock
  | ButtonBlock
  | SpacerBlock
  | DividerBlock
  | VideoBlock
  | CodeBlock
  | QuoteBlock
  | ListBlock
  | ColumnsBlock
  | CardBlock;

export interface PageDesign {
  version: string;
  blocks: PageBlock[];
  createdAt: string;
  updatedAt: string;
}
