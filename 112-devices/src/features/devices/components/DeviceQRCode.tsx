import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";
import { IDevice } from "../../types/device";

interface DeviceQRCodeProps {
    device: IDevice;
    size?: number;
}

export function DeviceQRCode({ device, size = 64 }: DeviceQRCodeProps) {
    const canvasRef = useRef<HTMLDivElement>(null);

    // Кодируем в QR ключевые данные об устройстве
    const qrValue = JSON.stringify({
        id: device.id,
        name: device.name,
        owner: device.owner,
        status: device.status,
        type: device.type,
    });

    function handleDownload() {
        const canvas = canvasRef.current?.querySelector("canvas");
        if (!canvas) return;

        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = `device-${device.id}-qr.png`;
        link.click();
    }

    return (
        <div className="flex items-center gap-2">
            <div ref={canvasRef} className="border border-slate-200 rounded-md p-1 bg-white">
                <QRCodeCanvas value={qrValue} size={size} level="M" />
            </div>
            <button
                onClick={handleDownload}
                title="Download QR code"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
                <Download className="size-4" />
            </button>
        </div>
    );
}