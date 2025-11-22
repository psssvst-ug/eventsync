"use client";

import React, { useState, useEffect } from "react";
import { PageBlock } from "@/lib/types/page-builder";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BlockEditorProps {
    block: PageBlock;
    onUpdate: (block: PageBlock) => void;
}

const BlockEditor: React.FC<BlockEditorProps> = ({ block, onUpdate }) => {
    const [editedBlock, setEditedBlock] = useState<PageBlock>(block);

    // Update local state when block prop changes from parent
    useEffect(() => {
        setEditedBlock(block);
    }, [block]);

    const updateField = (
        field: string,
        value: string | number | boolean | string[],
    ) => {
        const updatedBlock = {
            ...editedBlock,
            [field]: value,
        };
        setEditedBlock(updatedBlock);
        onUpdate(updatedBlock);
    };

    const updateStyleField = (field: string, value: string) => {
        let updatedBlock: PageBlock = editedBlock;
        if ("style" in editedBlock && typeof editedBlock.style === "object") {
            updatedBlock = {
                ...editedBlock,
                style: {
                    ...editedBlock.style,
                    [field]: value,
                },
            } as PageBlock;
        }
        setEditedBlock(updatedBlock);
        onUpdate(updatedBlock);
    };

    const renderEditor = () => {
        switch (editedBlock.type) {
            case "heading":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="content">Heading Text</Label>
                            <Input
                                id="content"
                                value={editedBlock.content}
                                onChange={(e) =>
                                    updateField("content", e.target.value)
                                }
                                placeholder="Enter heading text"
                            />
                        </div>
                        <div>
                            <Label htmlFor="level">Heading Level</Label>
                            <Select
                                value={editedBlock.level.toString()}
                                onValueChange={(value) =>
                                    updateField("level", parseInt(value))
                                }
                            >
                                <SelectTrigger id="level">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">H1</SelectItem>
                                    <SelectItem value="2">H2</SelectItem>
                                    <SelectItem value="3">H3</SelectItem>
                                    <SelectItem value="4">H4</SelectItem>
                                    <SelectItem value="5">H5</SelectItem>
                                    <SelectItem value="6">H6</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="color">Text Color</Label>
                            <Input
                                id="color"
                                type="color"
                                value={editedBlock.style?.color || "#000000"}
                                onChange={(e) =>
                                    updateStyleField("color", e.target.value)
                                }
                            />
                        </div>
                    </div>
                );

            case "paragraph":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="content">Paragraph Text</Label>
                            <Textarea
                                id="content"
                                value={editedBlock.content}
                                onChange={(e) =>
                                    updateField("content", e.target.value)
                                }
                                placeholder="Enter paragraph text"
                                rows={6}
                            />
                        </div>
                        <div>
                            <Label htmlFor="color">Text Color</Label>
                            <Input
                                id="color"
                                type="color"
                                value={editedBlock.style?.color || "#000000"}
                                onChange={(e) =>
                                    updateStyleField("color", e.target.value)
                                }
                            />
                        </div>
                    </div>
                );

            case "image":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="url">Image URL</Label>
                            <Input
                                id="url"
                                value={editedBlock.url}
                                onChange={(e) =>
                                    updateField("url", e.target.value)
                                }
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                        <div>
                            <Label htmlFor="alt">Alt Text</Label>
                            <Input
                                id="alt"
                                value={editedBlock.alt}
                                onChange={(e) =>
                                    updateField("alt", e.target.value)
                                }
                                placeholder="Image description"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="width">Width</Label>
                                <Input
                                    id="width"
                                    value={editedBlock.width || ""}
                                    onChange={(e) =>
                                        updateField("width", e.target.value)
                                    }
                                    placeholder="100%"
                                />
                            </div>
                            <div>
                                <Label htmlFor="height">Height</Label>
                                <Input
                                    id="height"
                                    value={editedBlock.height || ""}
                                    onChange={(e) =>
                                        updateField("height", e.target.value)
                                    }
                                    placeholder="auto"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="alignment">Alignment</Label>
                            <Select
                                value={editedBlock.alignment || "center"}
                                onValueChange={(value) =>
                                    updateField("alignment", value)
                                }
                            >
                                <SelectTrigger id="alignment">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="center">
                                        Center
                                    </SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );

            case "link":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="text">Link Text</Label>
                            <Input
                                id="text"
                                value={editedBlock.text}
                                onChange={(e) =>
                                    updateField("text", e.target.value)
                                }
                                placeholder="Click here"
                            />
                        </div>
                        <div>
                            <Label htmlFor="url">URL</Label>
                            <Input
                                id="url"
                                value={editedBlock.url}
                                onChange={(e) =>
                                    updateField("url", e.target.value)
                                }
                                placeholder="https://example.com"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="openInNewTab"
                                checked={editedBlock.openInNewTab || false}
                                onCheckedChange={(checked) =>
                                    updateField("openInNewTab", checked)
                                }
                            />
                            <Label htmlFor="openInNewTab">
                                Open in new tab
                            </Label>
                        </div>
                    </div>
                );

            case "button":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="text">Button Text</Label>
                            <Input
                                id="text"
                                value={editedBlock.text}
                                onChange={(e) =>
                                    updateField("text", e.target.value)
                                }
                                placeholder="Click me"
                            />
                        </div>
                        <div>
                            <Label htmlFor="url">URL</Label>
                            <Input
                                id="url"
                                value={editedBlock.url}
                                onChange={(e) =>
                                    updateField("url", e.target.value)
                                }
                                placeholder="https://example.com"
                            />
                        </div>
                        <div>
                            <Label htmlFor="variant">Variant</Label>
                            <Select
                                value={editedBlock.variant || "default"}
                                onValueChange={(value) =>
                                    updateField("variant", value)
                                }
                            >
                                <SelectTrigger id="variant">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">
                                        Default
                                    </SelectItem>
                                    <SelectItem value="destructive">
                                        Destructive
                                    </SelectItem>
                                    <SelectItem value="outline">
                                        Outline
                                    </SelectItem>
                                    <SelectItem value="secondary">
                                        Secondary
                                    </SelectItem>
                                    <SelectItem value="ghost">Ghost</SelectItem>
                                    <SelectItem value="link">Link</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="size">Size</Label>
                            <Select
                                value={editedBlock.size || "default"}
                                onValueChange={(value) =>
                                    updateField("size", value)
                                }
                            >
                                <SelectTrigger id="size">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">
                                        Default
                                    </SelectItem>
                                    <SelectItem value="sm">Small</SelectItem>
                                    <SelectItem value="lg">Large</SelectItem>
                                    <SelectItem value="icon">Icon</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="alignment">Alignment</Label>
                            <Select
                                value={editedBlock.alignment || "left"}
                                onValueChange={(value) =>
                                    updateField("alignment", value)
                                }
                            >
                                <SelectTrigger id="alignment">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="center">
                                        Center
                                    </SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );

            case "spacer":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="height">Height</Label>
                            <Input
                                id="height"
                                value={editedBlock.height}
                                onChange={(e) =>
                                    updateField("height", e.target.value)
                                }
                                placeholder="40px"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                Examples: 20px, 2rem, 50px
                            </p>
                        </div>
                    </div>
                );

            case "divider":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="style">Style</Label>
                            <Select
                                value={editedBlock.style || "solid"}
                                onValueChange={(value) =>
                                    updateField("style", value)
                                }
                            >
                                <SelectTrigger id="style">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="solid">Solid</SelectItem>
                                    <SelectItem value="dashed">
                                        Dashed
                                    </SelectItem>
                                    <SelectItem value="dotted">
                                        Dotted
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="thickness">Thickness</Label>
                            <Input
                                id="thickness"
                                value={editedBlock.thickness || "1px"}
                                onChange={(e) =>
                                    updateField("thickness", e.target.value)
                                }
                                placeholder="1px"
                            />
                        </div>
                        <div>
                            <Label htmlFor="color">Color</Label>
                            <Input
                                id="color"
                                type="color"
                                value={editedBlock.color || "#e5e7eb"}
                                onChange={(e) =>
                                    updateField("color", e.target.value)
                                }
                            />
                        </div>
                    </div>
                );

            case "video":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="url">Video URL</Label>
                            <Input
                                id="url"
                                value={editedBlock.url}
                                onChange={(e) =>
                                    updateField("url", e.target.value)
                                }
                                placeholder="https://youtube.com/watch?v=..."
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                Supports YouTube URLs and direct video links
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="width">Width</Label>
                                <Input
                                    id="width"
                                    value={editedBlock.width || ""}
                                    onChange={(e) =>
                                        updateField("width", e.target.value)
                                    }
                                    placeholder="100%"
                                />
                            </div>
                            <div>
                                <Label htmlFor="height">Height</Label>
                                <Input
                                    id="height"
                                    value={editedBlock.height || ""}
                                    onChange={(e) =>
                                        updateField("height", e.target.value)
                                    }
                                    placeholder="400px"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="controls"
                                checked={editedBlock.controls !== false}
                                onCheckedChange={(checked) =>
                                    updateField("controls", checked)
                                }
                            />
                            <Label htmlFor="controls">Show controls</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="autoplay"
                                checked={editedBlock.autoplay || false}
                                onCheckedChange={(checked) =>
                                    updateField("autoplay", checked)
                                }
                            />
                            <Label htmlFor="autoplay">Autoplay</Label>
                        </div>
                    </div>
                );

            case "code":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="content">Code</Label>
                            <Textarea
                                id="content"
                                value={editedBlock.content}
                                onChange={(e) =>
                                    updateField("content", e.target.value)
                                }
                                placeholder="// Your code here"
                                rows={8}
                                className="font-mono text-sm"
                            />
                        </div>
                        <div>
                            <Label htmlFor="language">Language</Label>
                            <Select
                                value={editedBlock.language || "javascript"}
                                onValueChange={(value) =>
                                    updateField("language", value)
                                }
                            >
                                <SelectTrigger id="language">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="javascript">
                                        JavaScript
                                    </SelectItem>
                                    <SelectItem value="typescript">
                                        TypeScript
                                    </SelectItem>
                                    <SelectItem value="python">
                                        Python
                                    </SelectItem>
                                    <SelectItem value="java">Java</SelectItem>
                                    <SelectItem value="html">HTML</SelectItem>
                                    <SelectItem value="css">CSS</SelectItem>
                                    <SelectItem value="bash">Bash</SelectItem>
                                    <SelectItem value="json">JSON</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );

            case "quote":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="content">Quote Text</Label>
                            <Textarea
                                id="content"
                                value={editedBlock.content}
                                onChange={(e) =>
                                    updateField("content", e.target.value)
                                }
                                placeholder="Enter quote..."
                                rows={4}
                            />
                        </div>
                        <div>
                            <Label htmlFor="author">Author (optional)</Label>
                            <Input
                                id="author"
                                value={editedBlock.author || ""}
                                onChange={(e) =>
                                    updateField("author", e.target.value)
                                }
                                placeholder="Author name"
                            />
                        </div>
                    </div>
                );

            case "list":
                return (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="ordered"
                                checked={editedBlock.ordered || false}
                                onCheckedChange={(checked) =>
                                    updateField("ordered", checked)
                                }
                            />
                            <Label htmlFor="ordered">Numbered list</Label>
                        </div>
                        <div>
                            <Label htmlFor="items">
                                List Items (one per line)
                            </Label>
                            <Textarea
                                id="items"
                                value={editedBlock.items.join("\n")}
                                onChange={(e) =>
                                    updateField(
                                        "items",
                                        e.target.value
                                            .split("\n")
                                            .filter((i) => i.trim()),
                                    )
                                }
                                placeholder="Item 1&#10;Item 2&#10;Item 3"
                                rows={6}
                            />
                        </div>
                    </div>
                );

            case "card":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Card Title (optional)</Label>
                            <Input
                                id="title"
                                value={editedBlock.title || ""}
                                onChange={(e) =>
                                    updateField("title", e.target.value)
                                }
                                placeholder="Card title"
                            />
                        </div>
                        <div>
                            <Label htmlFor="content">Card Content</Label>
                            <Textarea
                                id="content"
                                value={editedBlock.content}
                                onChange={(e) =>
                                    updateField("content", e.target.value)
                                }
                                placeholder="Enter card content..."
                                rows={6}
                            />
                        </div>
                    </div>
                );

            default:
                return (
                    <p className="text-muted-foreground">
                        No editor available for this block type.
                    </p>
                );
        }
    };

    return (
        <div className="space-y-6">
            <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="pr-4 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-1 capitalize">
                            {editedBlock.type} Block
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Configure the properties for this block
                        </p>
                    </div>

                    <Separator />

                    {renderEditor()}
                </div>
            </ScrollArea>
        </div>
    );
};

export default BlockEditor;
