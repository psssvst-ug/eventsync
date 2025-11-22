"use client";

import React from "react";
import { PageBlock } from "@/lib/types/page-builder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface BlockRendererProps {
    block: PageBlock;
    isPreview?: boolean;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({
    block,
    isPreview = false,
}) => {
    const renderBlock = () => {
        switch (block.type) {
            case "heading": {
                const HeadingTag = `h${block.level}` as
                    | "h1"
                    | "h2"
                    | "h3"
                    | "h4"
                    | "h5"
                    | "h6";
                const defaultStyles: React.CSSProperties = {
                    fontSize:
                        block.level === 1
                            ? "2.5rem"
                            : block.level === 2
                              ? "2rem"
                              : block.level === 3
                                ? "1.75rem"
                                : block.level === 4
                                  ? "1.5rem"
                                  : block.level === 5
                                    ? "1.25rem"
                                    : "1rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                };
                return React.createElement(
                    HeadingTag,
                    { style: { ...defaultStyles, ...block.style } },
                    block.content,
                );
            }

            case "paragraph": {
                return (
                    <p
                        style={{
                            marginBottom: "1rem",
                            lineHeight: "1.75",
                            ...block.style,
                        }}
                    >
                        {block.content}
                    </p>
                );
            }

            case "image": {
                const alignmentStyles: Record<string, React.CSSProperties> = {
                    left: { display: "block", marginRight: "auto" },
                    center: {
                        display: "block",
                        marginLeft: "auto",
                        marginRight: "auto",
                    },
                    right: { display: "block", marginLeft: "auto" },
                };

                return (
                    <div style={alignmentStyles[block.alignment || "center"]}>
                        {block.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={block.url}
                                alt={block.alt}
                                style={{
                                    width: block.width || "100%",
                                    height: block.height || "auto",
                                    borderRadius: "0.5rem",
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: block.width || "100%",
                                    height: block.height || "200px",
                                    backgroundColor: "hsl(var(--muted))",
                                    borderRadius: "0.5rem",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "hsl(var(--muted-foreground))",
                                }}
                            >
                                No image URL provided
                            </div>
                        )}
                    </div>
                );
            }

            case "link": {
                return (
                    <Link
                        href={block.url}
                        target={block.openInNewTab ? "_blank" : "_self"}
                        rel={
                            block.openInNewTab
                                ? "noopener noreferrer"
                                : undefined
                        }
                        style={{
                            color: "hsl(var(--primary))",
                            textDecoration: "underline",
                            ...block.style,
                        }}
                    >
                        {block.text}
                    </Link>
                );
            }

            case "button": {
                const alignmentStyles: Record<string, React.CSSProperties> = {
                    left: { display: "flex", justifyContent: "flex-start" },
                    center: { display: "flex", justifyContent: "center" },
                    right: { display: "flex", justifyContent: "flex-end" },
                };

                return (
                    <div style={alignmentStyles[block.alignment || "left"]}>
                        <Link href={block.url}>
                            <Button variant={block.variant} size={block.size}>
                                {block.text}
                            </Button>
                        </Link>
                    </div>
                );
            }

            case "spacer": {
                return <div style={{ height: block.height }} />;
            }

            case "divider": {
                return (
                    <hr
                        style={{
                            border: "none",
                            borderTop: `${block.thickness || "1px"} ${block.style || "solid"} ${block.color || "hsl(var(--border))"}`,
                            margin: "1.5rem 0",
                        }}
                    />
                );
            }

            case "video": {
                if (!block.url) {
                    return (
                        <div
                            style={{
                                width: block.width || "100%",
                                height: block.height || "400px",
                                backgroundColor: "hsl(var(--muted))",
                                borderRadius: "0.5rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "hsl(var(--muted-foreground))",
                            }}
                        >
                            No video URL provided
                        </div>
                    );
                }

                // Check if it's a YouTube URL
                const youtubeRegex =
                    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
                const youtubeMatch = block.url.match(youtubeRegex);

                if (youtubeMatch) {
                    return (
                        <div
                            style={{
                                width: block.width || "100%",
                                marginBottom: "1rem",
                            }}
                        >
                            <iframe
                                width="100%"
                                height={block.height || "400px"}
                                src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ borderRadius: "0.5rem" }}
                            />
                        </div>
                    );
                }

                // For other video URLs
                return (
                    <video
                        src={block.url}
                        controls={block.controls !== false}
                        autoPlay={block.autoplay}
                        style={{
                            width: block.width || "100%",
                            height: block.height || "auto",
                            borderRadius: "0.5rem",
                        }}
                    />
                );
            }

            case "code": {
                return (
                    <pre
                        style={{
                            backgroundColor: "hsl(var(--muted))",
                            padding: "1rem",
                            borderRadius: "0.5rem",
                            overflow: "auto",
                            marginBottom: "1rem",
                        }}
                    >
                        <code>{block.content}</code>
                    </pre>
                );
            }

            case "quote": {
                return (
                    <blockquote
                        style={{
                            borderLeft: "4px solid hsl(var(--primary))",
                            paddingLeft: "1rem",
                            marginLeft: 0,
                            fontStyle: "italic",
                            color: "hsl(var(--muted-foreground))",
                            marginBottom: "1rem",
                            ...block.style,
                        }}
                    >
                        <p
                            style={{
                                marginBottom: block.author ? "0.5rem" : 0,
                            }}
                        >
                            {block.content}
                        </p>
                        {block.author && (
                            <footer
                                style={{
                                    fontStyle: "normal",
                                    fontSize: "0.875rem",
                                }}
                            >
                                — {block.author}
                            </footer>
                        )}
                    </blockquote>
                );
            }

            case "list": {
                const ListTag = block.ordered ? "ol" : "ul";
                return (
                    <ListTag
                        style={{
                            paddingLeft: "1.5rem",
                            marginBottom: "1rem",
                            ...block.style,
                        }}
                    >
                        {block.items.map((item, index) => (
                            <li key={index} style={{ marginBottom: "0.5rem" }}>
                                {item}
                            </li>
                        ))}
                    </ListTag>
                );
            }

            case "columns": {
                return (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${block.columnCount}, 1fr)`,
                            gap: block.gap || "1rem",
                            marginBottom: "1rem",
                        }}
                    >
                        {block.columns.map((column, columnIndex) => (
                            <div key={columnIndex}>
                                {column.map((nestedBlock) => (
                                    <BlockRenderer
                                        key={nestedBlock.id}
                                        block={nestedBlock}
                                        isPreview={isPreview}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                );
            }

            case "card": {
                return (
                    <Card style={{ marginBottom: "1rem" }}>
                        {block.title && (
                            <CardHeader>
                                <CardTitle>{block.title}</CardTitle>
                            </CardHeader>
                        )}
                        <CardContent style={block.style}>
                            <p>{block.content}</p>
                        </CardContent>
                    </Card>
                );
            }

            default:
                return null;
        }
    };

    return (
        <div className={isPreview ? "block-preview" : "block-editor"}>
            {renderBlock()}
        </div>
    );
};

export default BlockRenderer;
