"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getConditionColor } from "@/lib/utils";
import { Eye, ImageIcon } from "lucide-react";
import { Tool, ToolImage } from "@/types";
import { getToolImages } from "@/services/tools";
import Image from "next/image";

type ViewToolDialogProps = {
  tool: Tool;
};

export default function ViewToolDialog({ tool }: ViewToolDialogProps) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<ToolImage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      if (!open) return;
      try {
        setLoading(true);
        const imgs = await getToolImages(tool.id);
        setImages(imgs);
      } catch (e) {
        console.error("Failed to fetch tool images", e);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [open, tool.id]);

  const initialImages = images.filter((i) => i.imageType === "initial");
  const finalImages = images.filter((i) => i.imageType === "final");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="size-4" />
          Detail
        </Button>
      </DialogTrigger>
      <DialogDescription className="sr-only">Detail alat</DialogDescription>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Alat</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nama</span>
              <span className="font-medium">{tool.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kategori</span>
              <span className="font-medium">{tool.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jumlah</span>
              <span className="font-medium">{tool.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Kondisi Awal</span>
              <Badge className={getConditionColor(tool.initialCondition)}>
                {tool.initialCondition}
              </Badge>
            </div>
            {tool.finalCondition && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Kondisi Akhir</span>
                <Badge className={getConditionColor(tool.finalCondition)}>
                  {tool.finalCondition}
                </Badge>
              </div>
            )}
          </div>

          {tool.notes && (
            <div className="text-sm">
              <div className="text-muted-foreground">Catatan</div>
              <p className="mt-1 bg-gray-50 p-2 rounded">{tool.notes}</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ImageIcon className="size-4" /> Foto Kondisi Awal
            </div>
            {loading ? (
              <div className="text-sm text-muted-foreground">
                Memuat gambar...
              </div>
            ) : initialImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {initialImages.map((img) => (
                  <Image
                    key={img.id}
                    src={img.publicUrl}
                    alt={img.fileName}
                    width={100}
                    height={100}
                    className="w-full h-32 object-cover rounded border"
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Tidak ada foto
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ImageIcon className="size-4" /> Foto Kondisi Akhir
            </div>
            {loading ? (
              <div className="text-sm text-muted-foreground">
                Memuat gambar...
              </div>
            ) : finalImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {finalImages.map((img) => (
                  <Image
                    key={img.id}
                    src={img.publicUrl}
                    alt={img.fileName}
                    width={100}
                    height={100}
                    className="w-full h-32 object-cover rounded border"
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Tidak ada foto
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
