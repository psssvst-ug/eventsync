import { PageDesign } from "@/lib/types/page-builder";

export class PageDesignStorage {
    private static STORAGE_KEY = "page-designs";

    /**
     * Save a page design to localStorage and sync to database
     */
    static async saveDesign(
        eventId: string,
        design: PageDesign,
    ): Promise<void> {
        try {
            // Save to localStorage
            const designs = this.getAllDesigns();
            designs[eventId] = design;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(designs));

            // Sync to database
            await this.syncToDatabase(eventId, design);
        } catch (error) {
            console.error("Failed to save design:", error);
            throw new Error("Failed to save design");
        }
    }

    /**
     * Sync page design to database
     */
    private static async syncToDatabase(
        eventId: string,
        design: PageDesign,
    ): Promise<void> {
        try {
            const response = await fetch(`/api/events/${eventId}/page`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ page: design }),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("Failed to sync to database:", error);
                // Don't throw error - localStorage save was successful
            }
        } catch (error) {
            console.error("Failed to sync to database:", error);
            // Don't throw error - localStorage save was successful
        }
    }

    /**
     * Load a page design from database or localStorage
     */
    static async loadDesign(eventId: string): Promise<PageDesign | null> {
        try {
            // Try to fetch from database first
            const dbDesign = await this.loadFromDatabase(eventId);
            if (dbDesign) {
                // Update localStorage with database version
                const designs = this.getAllDesigns();
                designs[eventId] = dbDesign;
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(designs));
                return dbDesign;
            }

            // Fall back to localStorage
            const designs = this.getAllDesigns();
            return designs[eventId] || null;
        } catch (error) {
            console.error("Failed to load design:", error);
            // Fall back to localStorage
            try {
                const designs = this.getAllDesigns();
                return designs[eventId] || null;
            } catch {
                return null;
            }
        }
    }

    /**
     * Load page design from database
     */
    private static async loadFromDatabase(
        eventId: string,
    ): Promise<PageDesign | null> {
        try {
            const response = await fetch(`/api/events/${eventId}/page`);

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return data.success && data.data?.page ? data.data.page : null;
        } catch (error) {
            console.error("Failed to load from database:", error);
            return null;
        }
    }

    /**
     * Delete a page design from localStorage
     */
    static deleteDesign(eventId: string): void {
        try {
            const designs = this.getAllDesigns();
            delete designs[eventId];
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(designs));
        } catch (error) {
            console.error("Failed to delete design:", error);
            throw new Error("Failed to delete design");
        }
    }

    /**
     * Get all page designs from localStorage
     */
    static getAllDesigns(): Record<string, PageDesign> {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error("Failed to get designs:", error);
            return {};
        }
    }

    /**
     * Export a design as a JSON file
     */
    static exportDesignAsFile(eventId: string, design: PageDesign): void {
        try {
            const dataStr = JSON.stringify(design, null, 2);
            const dataBlob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `page-design-${eventId}-${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export design:", error);
            throw new Error("Failed to export design");
        }
    }

    /**
     * Import a design from a JSON file
     */
    static async importDesignFromFile(file: File): Promise<PageDesign> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const design: PageDesign = JSON.parse(
                        e.target?.result as string,
                    );

                    // Validate design structure
                    if (!design.version || !Array.isArray(design.blocks)) {
                        throw new Error("Invalid design file structure");
                    }

                    resolve(design);
                } catch (error) {
                    reject(new Error("Invalid design file"));
                }
            };

            reader.onerror = () => {
                reject(new Error("Failed to read file"));
            };

            reader.readAsText(file);
        });
    }

    /**
     * Clear all designs from localStorage
     */
    static clearAllDesigns(): void {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
        } catch (error) {
            console.error("Failed to clear designs:", error);
            throw new Error("Failed to clear designs");
        }
    }
}
