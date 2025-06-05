"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import {
  IconQrcode,
  IconDownload,
  IconRefresh,
  IconUser,
  IconShield,
} from "@tabler/icons-react";
import QRCodeSVG from "react-qr-code";

interface QRCodeData {
  success: boolean;
  qrData: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function QRCodeCard() {
  const { data: session } = useSession();
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQRCode = async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/users/qr-code?userId=${session.user.id}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "A apărut o eroare");
      }

      setQrCodeData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "A apărut o eroare neașteptată"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = async () => {
    if (!qrCodeData) return;

    try {
      const svg = document.querySelector("#qr-code-svg") as SVGElement;
      if (!svg) return;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 256;
      canvas.height = 256;

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, 32, 32, 192, 192);

        canvas.toBlob((blob) => {
          if (!blob) return;

          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `qr-code-${qrCodeData.user.name
            .replace(/\s+/g, "-")
            .toLowerCase()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, "image/png");

        URL.revokeObjectURL(svgUrl);
      };
      img.src = svgUrl;
    } catch (error) {
      console.error("Error downloading QR code:", error);
      setError("Nu s-a putut descărca codul QR");
    }
  };

  useEffect(() => {
    fetchQRCode();
  }, [session?.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "antrenor":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "antrenor":
        return "Antrenor";
      default:
        return "Membru";
    }
  };

  return (
    <Card className="w-full max-w-sm h-full">
      <CardContent className="flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/10 rounded-xl">
            <IconQrcode className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Codul QR</h3>
            <p className="text-sm text-muted-foreground">Acces la sală</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="text-center space-y-4">
            <div className="text-red-500 text-sm">{error}</div>
            <Button onClick={fetchQRCode} variant="outline" size="sm">
              <IconRefresh className="h-4 w-4 mr-2" />
              Încearcă din nou
            </Button>
          </div>
        )}

        {qrCodeData && !isLoading && (
          <>
            <div className="flex-1 flex justify-center items-center flex-shrink-0 pb-3">
              <div className="bg-white p-3 rounded-lg border-2 border-gray-200 shadow-sm">
                <div className="w-32 h-32 flex items-center justify-center">
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={qrCodeData.qrData}
                    size={128}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="M"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t flex-shrink-0">
              <div className="flex items-center space-x-2">
                <IconUser className="h-3 w-3 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {qrCodeData.user.name}
                  </p>
                </div>
                <Badge
                  className={`${getRoleColor(
                    qrCodeData.user.role
                  )} text-xs px-1 py-0`}
                >
                  {getRoleText(qrCodeData.user.role)}
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <IconShield className="h-3 w-3 text-gray-500" />
                <p className="text-xs text-gray-500">
                  ID: {qrCodeData.user.id.slice(-8)}
                </p>
              </div>
            </div>

            <div className="flex space-x-2 pt-2 mt-auto">
              <Button
                onClick={downloadQRCode}
                className="flex-1 h-8 text-xs"
                variant="outline"
              >
                <IconDownload className="h-3 w-3 mr-1" />
                Descarcă
              </Button>
              <Button
                onClick={fetchQRCode}
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <IconRefresh className="h-3 w-3" />
              </Button>
            </div>

            <div className="mt-auto pt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Scanează pentru acces →
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
