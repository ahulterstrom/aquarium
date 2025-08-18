import { toast } from "@/components/ui/sonner";

export interface ScreenshotOptions {
  quality?: number; // 0-1 for JPEG quality
  format?: "png" | "jpeg" | "webp";
  filename?: string;
  width?: number;
  height?: number;
  toClipboard?: boolean;
}

export class ScreenshotService {
  private static instance: ScreenshotService;

  static getInstance(): ScreenshotService {
    if (!ScreenshotService.instance) {
      ScreenshotService.instance = new ScreenshotService();
    }
    return ScreenshotService.instance;
  }

  private constructor() {}

  /**
   * Capture screenshot from Three.js canvas
   */
  async captureCanvas(
    canvas: HTMLCanvasElement,
    options: ScreenshotOptions = {},
  ): Promise<boolean> {
    try {
      const {
        quality = 0.95,
        format = "png",
        filename,
        toClipboard = false,
      } = options;

      // Add watermark to canvas and get final blob
      const blob = await this.addWatermarkToCanvas(canvas, format, quality);

      if (!blob) {
        throw new Error("Failed to create image blob");
      }

      if (toClipboard) {
        await this.copyToClipboard(blob);
        toast({
          title: "Screenshot copied!",
          description: "Screenshot copied to clipboard 📸",
        });
      } else {
        const finalFilename = filename || this.generateFilename(format);
        await this.downloadBlob(blob, finalFilename);
        toast({
          title: "Screenshot saved!",
          description: `Screenshot saved as ${finalFilename} 📸`,
        });
      }

      return true;
    } catch (error) {
      console.error("Screenshot failed:", error);
      toast({
        title: "Screenshot failed",
        description: "Failed to take screenshot",
      });
      return false;
    }
  }

  /**
   * Add watermark to canvas and return blob
   */
  private async addWatermarkToCanvas(
    originalCanvas: HTMLCanvasElement,
    format: string,
    quality: number,
  ): Promise<Blob | null> {
    return new Promise((resolve) => {
      // Create composite canvas
      const compositeCanvas = document.createElement("canvas");
      const ctx = compositeCanvas.getContext("2d");

      if (!ctx) {
        resolve(null);
        return;
      }

      // Set canvas size to match original
      compositeCanvas.width = originalCanvas.width;
      compositeCanvas.height = originalCanvas.height;

      // Draw original canvas content
      ctx.drawImage(originalCanvas, 0, 0);

      // Add watermark text
      const fontSize = Math.max(24, originalCanvas.height * 0.03); // Responsive font size
      ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = "#49D1F1";
      ctx.textBaseline = "bottom";
      
      // Add semi-transparent background for readability
      const text = "Aquatopia";
      const textMetrics = ctx.measureText(text);
      const padding = 8;
      const bgX = 20 - padding;
      const bgY = originalCanvas.height - fontSize - 20 - padding;
      const bgWidth = textMetrics.width + (padding * 2);
      const bgHeight = fontSize + (padding * 2);
      
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
      
      // Draw text
      ctx.fillStyle = "#49D1F1";
      ctx.fillText(text, 20, originalCanvas.height - 20);

      // Convert to blob
      compositeCanvas.toBlob(
        resolve,
        `image/${format}`,
        format === "jpeg" ? quality : undefined,
      );
    });
  }

  /**
   * Copy image blob to clipboard
   */
  private async copyToClipboard(blob: Blob): Promise<void> {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const clipboardItem = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([clipboardItem]);
      } else {
        throw new Error("Clipboard API not supported");
      }
    } catch (error) {
      console.warn("Clipboard copy failed, falling back to download:", error);
      // Fallback to download
      await this.downloadBlob(blob, this.generateFilename("png"));
      throw new Error("Copied to downloads instead");
    }
  }

  /**
   * Download blob as file
   */
  private async downloadBlob(blob: Blob, filename: string): Promise<void> {
    const url = URL.createObjectURL(blob);

    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    }
  }

  /**
   * Generate timestamped filename
   */
  private generateFilename(format: string, suffix?: string): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").split(".")[0];
    const suffixPart = suffix ? `-${suffix}` : "";
    return `aquarium-screenshot-${timestamp}${suffixPart}.${format}`;
  }

  /**
   * Trigger screenshot flash effect
   */
  triggerFlash(): void {
    const flash = document.createElement("div");
    flash.style.position = "fixed";
    flash.style.top = "0";
    flash.style.left = "0";
    flash.style.width = "100vw";
    flash.style.height = "100vh";
    flash.style.backgroundColor = "white";
    flash.style.opacity = "0.8";
    flash.style.pointerEvents = "none";
    flash.style.zIndex = "9999";
    flash.style.transition = "opacity 0.2s ease-out";

    document.body.appendChild(flash);

    // Fade out the flash
    requestAnimationFrame(() => {
      flash.style.opacity = "0";
      setTimeout(() => {
        if (flash.parentNode) {
          flash.parentNode.removeChild(flash);
        }
      }, 200);
    });
  }
}

// Export singleton instance
export const screenshotService = ScreenshotService.getInstance();
