"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    DndContext,
    DragEndEvent,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageBlock, PageDesign, BlockType } from "@/lib/types/page-builder";
import BlockRenderer from "@/components/page-builder/block-renderer";
import BlockEditor from "@/components/page-builder/block-editor";
import { PageDesignStorage } from "@/lib/utils/page-design-storage";
import { useSession } from "@/lib/auth-client";
import {
    Heading1,
    Type,
    Image as ImageIcon,
    Link,
    Square,
    Minus,
    Divide,
    Video,
    Code,
    Quote,
    List,
    Columns,
    CreditCard,
    GripVertical,
    Edit,
    Trash2,
    Eye,
    Save,
    Plus,
    ArrowLeft,
    AlertCircle,
    X,
} from "lucide-react";
import { useTheme } from "next-themes";

interface SortableBlockProps {
    block: PageBlock;
    onEdit: (block: PageBlock) => void;
    onDelete: (id: string) => void;
}

const SortableBlock: React.FC<SortableBlockProps> = ({
    block,
    onEdit,
    onDelete,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const blockIcons: Record<BlockType, React.ReactNode> = {
        heading: <Heading1 className="h-4 w-4" />,
        paragraph: <Type className="h-4 w-4" />,
        image: <ImageIcon className="h-4 w-4" />,
        link: <Link className="h-4 w-4" />,
        button: <Square className="h-4 w-4" />,
        spacer: <Minus className="h-4 w-4" />,
        divider: <Divide className="h-4 w-4" />,
        video: <Video className="h-4 w-4" />,
        code: <Code className="h-4 w-4" />,
        quote: <Quote className="h-4 w-4" />,
        list: <List className="h-4 w-4" />,
        columns: <Columns className="h-4 w-4" />,
        card: <CreditCard className="h-4 w-4" />,
    };

    return (
        <div ref={setNodeRef} style={style} className="group relative">
            <Card className="mb-3 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <button
                            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                            {...attributes}
                            {...listeners}
                        >
                            <GripVertical className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-2 flex-1">
                            <span className="sr-only">{block.type} block</span>
                            {blockIcons[block.type]}
                            <span className="font-medium capitalize">
                                {block.type}
                            </span>
                            <Badge variant="outline" className="ml-2">
                                #{block.order}
                            </Badge>
                        </div>

                        <div className="flex gap-1 ">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onEdit(block)}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onDelete(block.id)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default function PageDesignerWithEvent() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;
    const { data: session, isPending } = useSession();
    const [blocks, setBlocks] = useState<PageBlock[]>([]);
    const [isLoadingDesign, setIsLoadingDesign] = useState(true);
    const [selectedBlock, setSelectedBlock] = useState<PageBlock | null>(null);
    const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    // Load design from database on mount
    useEffect(() => {
        const loadDesign = async () => {
            if (typeof window !== "undefined" && eventId) {
                setIsLoadingDesign(true);
                try {
                    const savedDesign =
                        await PageDesignStorage.loadDesign(eventId);
                    if (savedDesign && savedDesign.blocks) {
                        setBlocks(savedDesign.blocks);
                    }
                } catch (error) {
                    console.error("Failed to load design:", error);
                } finally {
                    setIsLoadingDesign(false);
                }
            } else {
                setIsLoadingDesign(false);
            }
        };

        loadDesign();
    }, [eventId]);

    // Check permissions - allow managers and admins (using useMemo to avoid setState in effect)
    const isAuthorized = useMemo(() => {
        if (isPending || !session) return false;
        const userRole = session.user.role;
        return userRole === "admin" || userRole === "manager";
    }, [session, isPending]);

    // Redirect if not authorized
    useEffect(() => {
        if (!isPending && session && !isAuthorized) {
            router.push(`/events/${eventId}`);
        }
    }, [isAuthorized, isPending, session, eventId, router]);

    const createBlock = useCallback(
        (type: BlockType): PageBlock => {
            const baseBlock = {
                id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type,
                order: blocks.length,
            };

            const defaultBlocks: Record<BlockType, PageBlock> = {
                heading: {
                    ...baseBlock,
                    type: "heading",
                    level: 2,
                    content: "New Heading",
                    style: {},
                },
                paragraph: {
                    ...baseBlock,
                    type: "paragraph",
                    content: "Enter your text here...",
                    style: {},
                },
                image: {
                    ...baseBlock,
                    type: "image",
                    url: "",
                    alt: "Image description",
                    alignment: "center",
                },
                link: {
                    ...baseBlock,
                    type: "link",
                    text: "Click here",
                    url: "#",
                    openInNewTab: false,
                    style: {},
                },
                button: {
                    ...baseBlock,
                    type: "button",
                    text: "Button",
                    url: "#",
                    variant: "default",
                    size: "default",
                    alignment: "left",
                },
                spacer: { ...baseBlock, type: "spacer", height: "40px" },
                divider: {
                    ...baseBlock,
                    type: "divider",
                    style: "solid",
                    thickness: "1px",
                },
                video: {
                    ...baseBlock,
                    type: "video",
                    url: "",
                    width: "100%",
                    height: "400px",
                },
                code: {
                    ...baseBlock,
                    type: "code",
                    content: "// Your code here",
                    language: "javascript",
                },
                quote: {
                    ...baseBlock,
                    type: "quote",
                    content: "Inspiring quote...",
                    style: {},
                },
                list: {
                    ...baseBlock,
                    type: "list",
                    items: ["Item 1", "Item 2", "Item 3"],
                    ordered: false,
                    style: {},
                },
                columns: {
                    ...baseBlock,
                    type: "columns",
                    columns: [[], []],
                    columnCount: 2,
                    gap: "1rem",
                },
                card: {
                    ...baseBlock,
                    type: "card",
                    content: "Card content...",
                    style: {},
                },
            };

            return defaultBlocks[type];
        },
        [blocks.length],
    );

    const addBlock = (type: BlockType) => {
        const newBlock = createBlock(type);
        setBlocks([...blocks, newBlock]);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex(
                    (item) => item.id === active.id,
                );
                const newIndex = items.findIndex((item) => item.id === over.id);
                const reordered = arrayMove(items, oldIndex, newIndex);
                return reordered.map((block, index) => ({
                    ...block,
                    order: index,
                }));
            });
        }
    };

    const handleUpdateBlock = (updatedBlock: PageBlock) => {
        setBlocks(
            blocks.map((block) =>
                block.id === updatedBlock.id ? updatedBlock : block,
            ),
        );
    };

    const handleDeleteBlock = (id: string) => {
        setBlocks(
            blocks
                .filter((block) => block.id !== id)
                .map((block, index) => ({ ...block, order: index })),
        );
    };

    const handleEditBlock = (block: PageBlock) => {
        setSelectedBlock(block);
    };

    // Show loading state while checking authentication
    if (isPending) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Show error if not logged in
    if (!session) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            Authentication Required
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            You must be logged in to access the page designer.
                        </p>
                        <Button
                            onClick={() => router.push("/auth/sign-in")}
                            className="w-full"
                        >
                            Sign In
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show error if not authorized
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            Access Denied
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            You don&apos;t have permission to customize this
                            event page. Only managers and administrators can
                            access the page designer.
                        </p>
                        <Button
                            onClick={() => router.push(`/events/${eventId}`)}
                            className="w-full"
                        >
                            Back to Event
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const exportDesign = () => {
        const design: PageDesign = {
            version: "1.0.0",
            blocks,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        PageDesignStorage.exportDesignAsFile(eventId, design);
    };

    const importDesign = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            PageDesignStorage.importDesignFromFile(file)
                .then((design) => {
                    setBlocks(design.blocks);
                })
                .catch((error) => {
                    alert("Invalid design file: " + error.message);
                });
        }
    };

    const saveDesign = async () => {
        const design: PageDesign = {
            version: "1.0.0",
            blocks,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        try {
            await PageDesignStorage.saveDesign(eventId, design);
            alert("Design saved successfully to database!");
        } catch (error) {
            console.error("Failed to save design:", error);
            alert("Failed to save design. Please try again.");
        }
    };

    const blockTypes: {
        type: BlockType;
        icon: React.ReactNode;
        label: string;
    }[] = [
        {
            type: "heading",
            icon: <Heading1 className="h-5 w-5" />,
            label: "Heading",
        },
        {
            type: "paragraph",
            icon: <Type className="h-5 w-5" />,
            label: "Paragraph",
        },
        {
            type: "image",
            icon: <ImageIcon className="h-5 w-5" />,
            label: "Image",
        },
        { type: "link", icon: <Link className="h-5 w-5" />, label: "Link" },
        {
            type: "button",
            icon: <Square className="h-5 w-5" />,
            label: "Button",
        },
        { type: "video", icon: <Video className="h-5 w-5" />, label: "Video" },
        { type: "code", icon: <Code className="h-5 w-5" />, label: "Code" },
        { type: "quote", icon: <Quote className="h-5 w-5" />, label: "Quote" },
        { type: "list", icon: <List className="h-5 w-5" />, label: "List" },
        {
            type: "card",
            icon: <CreditCard className="h-5 w-5" />,
            label: "Card",
        },
        {
            type: "spacer",
            icon: <Minus className="h-5 w-5" />,
            label: "Spacer",
        },
        {
            type: "divider",
            icon: <Divide className="h-5 w-5" />,
            label: "Divider",
        },
    ];

    // Show loading state while design is being loaded
    if (isLoadingDesign) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                    <p className="text-muted-foreground">
                        Loading page design...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/events/${eventId}`)}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">
                                Page Designer
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Customize event page
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={saveDesign}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Design
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-12 gap-6">
                    {/* Sidebar - Block Library */}
                    <div className="col-span-3">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plus className="h-5 w-5" />
                                    Add Blocks
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[calc(100vh-240px)]">
                                    <div className="grid grid-cols-2 gap-2">
                                        {blockTypes.map((blockType) => (
                                            <Button
                                                key={blockType.type}
                                                variant="outline"
                                                className="h-auto flex-col gap-2 p-3"
                                                onClick={() =>
                                                    addBlock(blockType.type)
                                                }
                                            >
                                                {blockType.icon}
                                                <span className="text-xs">
                                                    {blockType.label}
                                                </span>
                                            </Button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Editor Area */}
                    <div className="col-span-9">
                        <Tabs
                            value={activeTab}
                            onValueChange={(v) =>
                                setActiveTab(v as "editor" | "preview")
                            }
                        >
                            <TabsList className="mb-4">
                                <TabsTrigger value="editor">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editor
                                </TabsTrigger>
                                <TabsTrigger value="preview">
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="editor" className="mt-0">
                                <div className="grid grid-cols-12 gap-6">
                                    {/* Blocks List */}
                                    <div
                                        className={
                                            selectedBlock
                                                ? "col-span-7"
                                                : "col-span-12"
                                        }
                                    >
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle>
                                                        <span className="sr-only">
                                                            Page blocks list
                                                        </span>
                                                        Page Blocks (
                                                        {blocks.length})
                                                    </CardTitle>
                                                    {blocks.length > 0 && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setBlocks([]);
                                                                setSelectedBlock(
                                                                    null,
                                                                );
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Clear All
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <ScrollArea className="h-[calc(100vh-280px)]">
                                                    {blocks.length === 0 ? (
                                                        <div className="text-center py-12 text-muted-foreground">
                                                            <Type className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                            <p>
                                                                No blocks yet.
                                                                Add blocks from
                                                                the sidebar to
                                                                get started.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <DndContext
                                                            sensors={sensors}
                                                            collisionDetection={
                                                                closestCenter
                                                            }
                                                            onDragEnd={
                                                                handleDragEnd
                                                            }
                                                        >
                                                            <SortableContext
                                                                items={blocks.map(
                                                                    (b) => b.id,
                                                                )}
                                                                strategy={
                                                                    verticalListSortingStrategy
                                                                }
                                                            >
                                                                {blocks.map(
                                                                    (block) => (
                                                                        <SortableBlock
                                                                            key={
                                                                                block.id
                                                                            }
                                                                            block={
                                                                                block
                                                                            }
                                                                            onEdit={
                                                                                handleEditBlock
                                                                            }
                                                                            onDelete={
                                                                                handleDeleteBlock
                                                                            }
                                                                        />
                                                                    ),
                                                                )}
                                                            </SortableContext>
                                                        </DndContext>
                                                    )}
                                                </ScrollArea>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Editor Panel */}
                                    {selectedBlock && (
                                        <div className="col-span-5">
                                            <Card>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle>
                                                            Edit Block
                                                        </CardTitle>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                setSelectedBlock(
                                                                    null,
                                                                )
                                                            }
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <BlockEditor
                                                        block={selectedBlock}
                                                        onUpdate={
                                                            handleUpdateBlock
                                                        }
                                                    />
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="preview" className="mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Preview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-[calc(100vh-280px)]">
                                            <div className="max-w-4xl mx-auto space-y-6 p-6 bg-muted/30 rounded-lg">
                                                {blocks.length === 0 ? (
                                                    <div className="text-center py-12 text-muted-foreground">
                                                        <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                        <p>
                                                            Preview will appear
                                                            here once you add
                                                            blocks
                                                        </p>
                                                    </div>
                                                ) : (
                                                    blocks
                                                        .sort(
                                                            (a, b) =>
                                                                a.order -
                                                                b.order,
                                                        )
                                                        .map((block) => (
                                                            <BlockRenderer
                                                                key={block.id}
                                                                block={block}
                                                                isPreview
                                                            />
                                                        ))
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
