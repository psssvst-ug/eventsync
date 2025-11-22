"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  Camera,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ScanResult {
  success: boolean;
  message: string;
  data?: {
    id: string;
    teamName: string;
    label: string;
    trackingType: string;
    scannedAt: string;
    scannedBy: string;
  };
}

interface EventData {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  location?: string;
  status: string;
}

export default function QRScannerPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;
    const { data: session, isPending } = useSession();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState("");
  const [scanningActive, setScanningActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);
  const jsQRRef = useRef<
    | ((
        data: Uint8ClampedArray,
        width: number,
        height: number,
        options?: {
          inversionAttempts?:
            | "attemptBoth"
            | "dontInvert"
            | "onlyInvert"
            | "invertFirst";
        },
      ) => { data: string } | null)
    | null
  >(null);

  // Handle QR detection
  const handleQRDetection = useCallback(
    async (qrData: string) => {
      try {
        // Stop scanning
        setScanningActive(false);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }

        // Verify the QR code
        setSubmitting(true);
        setScanResult(null);

        const response = await fetch(`/api/events/${eventId}/verify-qr`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ qrData }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setScanResult({
            success: true,
            message: result.message || "QR code verified successfully!",
            data: result.data,
          });
          // Stop camera on success
          setScanningActive(false);
          setCameraActive(false);
          cleanup();
        } else {
          setScanResult({
            success: false,
            message: result.message || "Failed to verify QR code",
          });
          // Continue scanning after error
          setTimeout(() => {
            if (cameraActive) {
              setScanResult(null);
              setScanningActive(true);
              isProcessingRef.current = false;
            }
          }, 2000);
        }
      } catch (error) {
        console.error("Error handling QR detection:", error);
        setScanResult({
          success: false,
          message: "Error processing QR code",
        });
        // Continue scanning after error
        setTimeout(() => {
          if (cameraActive) {
            setScanResult(null);
            setScanningActive(true);
            isProcessingRef.current = false;
          }
        }, 2000);
      } finally {
        setSubmitting(false);
        isProcessingRef.current = false;
      }
    },
    [eventId, cameraActive],
  );

  // Load jsQR library once
  useEffect(() => {
    import("jsqr").then((module) => {
      jsQRRef.current = module.default;
    });
  }, []);

  useEffect(() => {
    loadEvent();
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

    if (isPending || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                    {isPending ? "Loading session..." : "Loading event..."}
                </p>
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                            <h2 className="text-xl font-semibold mb-2">
                                Authentication Required
                            </h2>
                            <p className="text-muted-foreground mb-4">
                                Please sign in to access the QR scanner.
                            </p>
                            <Button onClick={() => router.push("/auth")}>
                                Sign In
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
      }

      // Stop any existing stream
      cleanup();

      // Request camera with optimal settings
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (!videoRef.current) {
        throw new Error("Video element not found");
      }

      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute("playsinline", "true");

      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) {
          reject(new Error("Video element lost"));
          return;
        }

        const timeoutId = setTimeout(() => {
          reject(new Error("Video load timeout"));
        }, 10000);

        videoRef.current.onloadedmetadata = () => {
          clearTimeout(timeoutId);
          videoRef.current
            ?.play()
            .then(() => resolve())
            .catch(reject);
        };

        videoRef.current.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error("Video element error"));
        };
      });

      setCameraActive(true);
      setScanningActive(true);

      // Start continuous scanning
      requestAnimationFrame(scanFrame);
    } catch (err) {
      console.error("Camera error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      if (
        errorMessage.includes("Permission denied") ||
        errorMessage.includes("NotAllowedError") ||
        errorMessage.includes("permission")
      ) {
        setError(
          "Camera access denied. Please allow camera permissions and refresh the page.",
        );
      } else if (
        errorMessage.includes("not found") ||
        errorMessage.includes("NotFoundError")
      ) {
        setError(
          "No camera found. Please connect a camera or use manual entry.",
        );
      } else if (errorMessage.includes("not supported")) {
        setError(
          "Camera not supported. Please use HTTPS, a modern browser, or try manual entry.",
        );
      } else {
        setError(`Camera error: ${errorMessage}. Please try manual entry.`);
      }

      cleanup();
      setCameraActive(false);
      setScanningActive(false);
    }
  };

  const scanFrame = useCallback(() => {
    if (
      !scanningActive ||
      !videoRef.current ||
      !canvasRef.current ||
      !jsQRRef.current
    ) {
      return;
    }

    // Skip if already processing a QR code
    if (isProcessingRef.current) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Check if video is ready
    if (
      video.readyState !== video.HAVE_ENOUGH_DATA ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Try to detect QR code with multiple inversion attempts
    if (jsQRRef.current) {
      const code = jsQRRef.current(
        imageData.data,
        imageData.width,
        imageData.height,
        {
          inversionAttempts: "attemptBoth",
        },
      );

      if (code && code.data) {
        // QR code detected!
        isProcessingRef.current = true;
        handleQRDetection(code.data);
        return;
      }
    }

    // Continue scanning
    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [scanningActive, handleQRDetection]);

  const stopCamera = () => {
    setScanningActive(false);
    setCameraActive(false);
    cleanup();
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    await handleQRDetection(manualCode.trim());
    setManualCode("");
  };

  const resetScanner = () => {
    setScanResult(null);
    setError("");
    setManualCode("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The event you&apos;re looking for doesn&apos;t exist.
              </p>
              <Button onClick={() => router.push("/events")}>
                Back to Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/events/${eventId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Event
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">QR Scanner</h1>
              <p className="text-muted-foreground">{event.title}</p>
            </div>
            <Badge
              variant={event.status === "running" ? "default" : "secondary"}
            >
              {event.status}
            </Badge>
          </div>
        </div>

        {!cameraActive && !scanResult && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Camera Requirements:</strong> Grant camera permissions
              when prompted. Using HTTPS or localhost is required. If the camera
              doesn&apos;t work, use manual entry below.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-destructive">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {scanResult ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                {scanResult.success ? (
                  <>
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                    <div>
                      <h2 className="text-2xl font-bold text-green-500 mb-2">
                        Verified!
                      </h2>
                      <p className="text-muted-foreground">
                        {scanResult.message}
                      </p>
                    </div>

                    {scanResult.data && (
                      <div className="bg-muted rounded-lg p-4 text-left space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Team:
                          </span>
                          <span className="text-sm font-medium">
                            {scanResult.data.teamName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Type:
                          </span>
                          <span className="text-sm font-medium capitalize">
                            {scanResult.data.trackingType.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Label:
                          </span>
                          <span className="text-sm font-medium">
                            {scanResult.data.label}
                          </span>
                        </div>
                      </div>
                    )}

                    <Button onClick={resetScanner} className="w-full">
                      Scan Another QR Code
                    </Button>
                  </>
                ) : (
                  <>
                    <XCircle className="h-16 w-16 text-destructive mx-auto" />
                    <div>
                      <h2 className="text-2xl font-bold text-destructive mb-2">
                        Invalid
                      </h2>
                      <p className="text-muted-foreground">
                        {scanResult.message}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={resetScanner}
                        variant="outline"
                        className="flex-1"
                      >
                        Try Again
                      </Button>
                      {!cameraActive && (
                        <Button onClick={startCamera} className="flex-1">
                          <Camera className="h-4 w-4 mr-2" />
                          Restart Camera
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Camera Scanner
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!cameraActive ? (
                  <div className="text-center py-8">
                    <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Position the QR code in front of your camera
                    </p>
                    <Button onClick={startCamera} size="lg">
                      <Camera className="h-4 w-4 mr-2" />
                      Start Camera
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        className="w-full h-auto"
                        autoPlay
                        playsInline
                        muted
                      />
                      <canvas ref={canvasRef} className="hidden" />

                      {scanningActive && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="relative">
                            <div className="border-4 border-primary rounded-lg w-64 h-64" />
                            <div className="absolute top-0 left-0 right-0 h-1 bg-primary animate-pulse" />
                          </div>
                        </div>
                      )}

                      {submitting && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="bg-white rounded-lg p-4 flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            <span className="text-sm font-medium">
                              Verifying...
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={stopCamera}
                        variant="outline"
                        className="flex-1"
                        disabled={submitting}
                      >
                        Stop Camera
                      </Button>
                    </div>

                    {scanningActive && !submitting && (
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          📷 Scanning for QR codes...
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manual Entry</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      QR Code ID
                    </label>
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Enter QR code ID manually"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={submitting}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!manualCode.trim() || submitting}
                    className="w-full"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
