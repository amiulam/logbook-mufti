"use client";

import { useEffect, useState } from "react";
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
import {
  updateToolConditions,
  saveToolImages,
  getToolsByEventId,
} from "@/services/tools";
import { uploadToolImages } from "@/services/storage";
import { endEvent } from "@/services/events";
import { useEventStore } from "@/stores/eventStores";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { endEventSchema } from "@/../drizzle/schema";
import ImageUpload from "@/components/image-upload";
import { Loader2 } from "lucide-react";
import { TOOL_CONDITIONS } from "@/lib/constant";
import { getConditionColor } from "@/lib/utils";
import { ToolWithImages } from "@/types";
import Checkbox from "@/components/ui/checkbox";
import z from "zod";

type EndEventFormValues = z.input<typeof endEventSchema>;

export default function EndEventModal() {
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Record<number, File[]>>(
    {}
  );
  const [isUploading, setIsUploading] = useState(false);
  const [tools, setTools] = useState<ToolWithImages[]>([]);

  const endEventModal = useEventStore((state) => state.endModalDialogOpen);
  const setEndEventModal = useEventStore(
    (state) => state.setEndModalDialogOpen
  );

  const form = useForm<EndEventFormValues>({
    resolver: zodResolver(endEventSchema),
    defaultValues: {
      toolConditions: tools.map((tool) => ({
        toolId: tool.id,
        sameAsInitial: false,
        finalCondition: "",
        notes: "",
        finalImages: [],
      })),
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Fetch tools when modal opens
  useEffect(() => {
    const fetchTools = async () => {
      if (endEventModal.open && endEventModal.eventId) {
        try {
          const toolsData = await getToolsByEventId(+endEventModal.eventId);
          setTools(toolsData);

          // Update form default values
          form.reset({
            toolConditions: toolsData.map((tool: ToolWithImages) => ({
              toolId: tool.id,
              sameAsInitial: false,
              finalCondition: "",
              notes: "",
              finalImages: [],
            })),
          });
        } catch (error) {
          console.error("Error fetching tools:", error);
        }
      }
    };

    fetchTools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endEventModal]);

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

  const handleSameAsInitialChange = (
    toolId: number,
    checked: boolean,
    initialCondition: string
  ) => {
    const currentConditions = form.getValues("toolConditions");
    const toolIndex = tools.findIndex((t) => t.id === toolId);

    const updatedConditions = currentConditions.map((condition) =>
      condition.toolId === toolId
        ? {
            ...condition,
            sameAsInitial: checked,
            finalCondition: checked
              ? initialCondition
              : condition.finalCondition,
            notes: checked ? "" : condition.notes,
            finalImages: checked ? [] : condition.finalImages,
          }
        : condition
    );

    // Update form values without immediate validation
    form.setValue("toolConditions", updatedConditions, {
      shouldValidate: false,
      shouldDirty: true,
      shouldTouch: true,
    });

    // Clear ALL errors for this tool when checked
    if (checked) {
      form.clearErrors([
        `toolConditions.${toolIndex}.finalCondition`,
        `toolConditions.${toolIndex}.finalImages`,
        `toolConditions.${toolIndex}.notes`,
      ]);

      // Also clear selectedImages for this tool
      setSelectedImages((prev) => {
        const newState = { ...prev };
        delete newState[toolId];
        return newState;
      });

      // Force clear the finalImages field value in form
      form.setValue(`toolConditions.${toolIndex}.finalImages`, [], {
        shouldValidate: false,
      });
    }
  };

  const handleSubmit = async (values: EndEventFormValues) => {
    if (!endEventModal.eventId) {
      return;
    }

    if (loading || isUploading) return;

    setLoading(true);
    setIsUploading(true);

    try {
      // Update tool conditions first
      const updates = values.toolConditions.map((condition) => ({
        toolId: condition.toolId,
        finalCondition: condition.sameAsInitial
          ? tools.find((t) => t.id === condition.toolId)?.initialCondition || ""
          : condition.finalCondition || "",
        notes: condition.sameAsInitial ? "" : condition.notes,
      }));

      await updateToolConditions(updates);

      // Upload final condition images for each tool (only when not sameAsInitial)
      for (const condition of values.toolConditions) {
        if (condition.sameAsInitial) continue;
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

      await endEvent(+endEventModal.eventId);

      // Reset form and close dialog
      form.reset();
      setSelectedImages({});
      setTools([]);
      setEndEventModal(false, null);
    } catch (error) {
      console.error("Error ending event:", error);
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

                  {/* Same as initial checkbox */}
                  <FormField
                    control={form.control}
                    name={`toolConditions.${index}.sameAsInitial`}
                    render={({ field }) => (
                      <FormItem className="flex items-start gap-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onChange={(e) => {
                              field.onChange(e.target.checked);
                              handleSameAsInitialChange(
                                tool.id,
                                e.target.checked,
                                tool.initialCondition
                              );
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="m-0">
                            Sama dengan kondisi awal
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Final Condition Form */}
                  {!form.watch(`toolConditions.${index}.sameAsInitial`) && (
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
                          {/* Only show error when not sameAsInitial */}
                          {!!form.formState.errors.toolConditions?.[index]
                            ?.finalCondition && <FormMessage />}
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Notes Form */}
                  {!form.watch(`toolConditions.${index}.sameAsInitial`) && (
                    <FormField
                      control={form.control}
                      name={`toolConditions.${index}.notes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catatan (Opsional)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Tambahkan catatan kondisi alat..."
                              rows={2}
                            />
                          </FormControl>
                          {!!form.formState.errors.toolConditions?.[index]
                            ?.notes && <FormMessage />}
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Final Images Upload */}
                  {!form.watch(`toolConditions.${index}.sameAsInitial`) && (
                    <FormField
                      control={form.control}
                      name={`toolConditions.${index}.finalImages`}
                      render={() => (
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
                              required={form.formState.submitCount > 0}
                              error={
                                form.formState.submitCount > 0
                                  ? (form.formState.errors.toolConditions?.[
                                      index
                                    ]?.finalImages
                                      ?.message as unknown as string)
                                  : undefined
                              }
                            />
                          </FormControl>
                          {form.formState.submitCount > 0 &&
                            !!form.formState.errors.toolConditions?.[index]
                              ?.finalImages && <FormMessage />}
                        </FormItem>
                      )}
                    />
                  )}
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
