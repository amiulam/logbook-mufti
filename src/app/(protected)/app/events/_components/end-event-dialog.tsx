"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tool } from "@/types";
import { updateToolConditions, saveToolImages } from "@/services/tools";
import { uploadToolImages } from "@/services/storage";
import { endEvent } from "@/services/events";
import { useEventStore } from "@/stores/eventStores";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { endEventSchema, EndEventFormData } from "@/../drizzle/schema";
import ImageUpload from "@/components/ImageUpload";
import { Loader2 } from "lucide-react";
import { TOOL_CONDITIONS } from "@/lib/constant";
import { getConditionColor } from "@/lib/utils";

type EndEventModalProps = {
  tools: Tool[];
};

export default function EndEventModal({ tools }: EndEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Record<number, File[]>>(
    {}
  );
  const [isUploading, setIsUploading] = useState(false);

  const endEventModal = useEventStore((state) => state.endModalDialogOpen);
  const setEndEventModal = useEventStore(
    (state) => state.setEndModalDialogOpen
  );

  const form = useForm<EndEventFormData>({
    resolver: zodResolver(endEventSchema),
    defaultValues: {
      toolConditions: tools.map((tool) => ({
        toolId: tool.id,
        finalCondition: "",
        notes: "",
        finalImages: [],
      })),
    },
  });

  const handleImagesChange = (toolId: number, images: File[]) => {
    setSelectedImages((prev) => ({
      ...prev,
      [toolId]: images,
    }));

    // Update form value
    const currentConditions = form.getValues("toolConditions");
    const updatedConditions = currentConditions.map((condition) =>
      condition.toolId === toolId
        ? { ...condition, finalImages: images }
        : condition
    );
    form.setValue("toolConditions", updatedConditions, {
      shouldValidate: true,
    });
  };

  const handleSubmit = async (values: EndEventFormData) => {
    if (loading || isUploading) return;

    setLoading(true);
    setIsUploading(true);

    try {
      // Update tool conditions first
      const updates = values.toolConditions.map((condition) => ({
        toolId: condition.toolId,
        finalCondition: condition.finalCondition,
        notes: condition.notes,
      }));

      await updateToolConditions(updates);

      // Upload final condition images for each tool
      for (const condition of values.toolConditions) {
        const images = selectedImages[condition.toolId] || [];
        if (images.length > 0) {
          const uploadedImages = await uploadToolImages(
            images,
            condition.toolId,
            "final"
          );
          await saveToolImages(condition.toolId, uploadedImages);
        }
      }

      // Reset form and close dialog
      form.reset();
      setSelectedImages({});
      setEndEventModal(false, null);
    } catch (error) {
      console.error("Error ending event:", error);
      // Show user-friendly error message
      alert(
        `Gagal mengakhiri kegiatan: ${
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan yang tidak diketahui"
        }`
      );
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <Dialog
      open={endEventModal.open}
      onOpenChange={(open) => setEndEventModal(open, null)}
    >
      <DialogDescription className="sr-only">
        Dialog untuk menyelesaikan kegiatan
      </DialogDescription>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Periksa Kondisi Alat Sebelum Mengakhiri Kegiatan
          </DialogTitle>
        </DialogHeader>

        {tools.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Tidak ada alat yang ditugaskan untuk kegiatan ini.
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {tools.map((tool, index) => (
                <Card key={tool.id} className="p-4 gap-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{tool.name}</h3>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>Kategori: {tool.category}</div>
                      <div>Total: {tool.total}</div>
                    </div>
                  </div>

                  {/* Initial Condition Display */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Kondisi Awal:</span>
                    <Badge className={getConditionColor(tool.initialCondition)}>
                      {tool.initialCondition}
                    </Badge>
                  </div>

                  {/* Initial Images Display */}
                  {tool.images && tool.images.length > 0 && (
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-medium">
                        Foto Kondisi Awal:
                      </FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {tool.images
                          .filter((img) => img.imageType === "initial")
                          .map((image) => (
                            <div key={image.id} className="relative">
                              <img
                                src={image.publicUrl}
                                alt={image.fileName}
                                className="w-full h-40 object-cover rounded border"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b">
                                {image.fileName}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Final Condition Form */}
                  <FormField
                    control={form.control}
                    name={`toolConditions.${index}.finalCondition`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Kondisi Akhir
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Pilih kondisi akhir" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TOOL_CONDITIONS.map((condition) => (
                              <SelectItem
                                key={condition.value}
                                value={condition.value}
                              >
                                {condition.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Notes Form */}
                  <FormField
                    control={form.control}
                    name={`toolConditions.${index}.notes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan (Opsional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Add any notes about the tool condition..."
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Final Images Upload */}
                  <FormField
                    control={form.control}
                    name={`toolConditions.${index}.finalImages`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Foto Kondisi Akhir
                        </FormLabel>
                        <FormControl>
                          <ImageUpload
                            onImagesChange={(images) =>
                              handleImagesChange(tool.id, images)
                            }
                            maxImages={5}
                            required={true}
                            error={
                              form.formState.errors.toolConditions?.[index]
                                ?.finalImages?.message
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>
              ))}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEndEventModal(false, null)}
                  disabled={loading || isUploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || isUploading || !form.formState.isValid}
                  variant="destructive"
                  // className="min-w-[120px]"
                >
                  {loading || isUploading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      {isUploading ? "Uploading..." : "Ending Event..."}
                    </>
                  ) : (
                    "End Event"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
