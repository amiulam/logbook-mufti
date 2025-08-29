"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";
import { createEvent } from "@/services/events";
import { saveEventDocument } from "@/services/events";
import { uploadEventDocument } from "@/services/storage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { eventInsertSchema } from "@/../drizzle/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import DocumentUpload from "@/components/document-upload";

// Extended schema to include document
const createEventWithDocumentSchema = eventInsertSchema.extend({
  document: z.any().refine((file) => file instanceof File, {
    message: "Document harus diupload",
  }),
});

export default function CreateEventModal() {
  const [open, setOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  // const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof createEventWithDocumentSchema>>({
    resolver: zodResolver(createEventWithDocumentSchema),
    defaultValues: {
      name: "",
      document: null,
    },
  });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting, isDirty, errors },
  } = form;

  const onSubmit = async (
    values: z.infer<typeof createEventWithDocumentSchema>
  ) => {
    if (!selectedDocument) {
      alert("Please select a document");
      return;
    }

    try {
      // setIsSubmitting(true);

      // Create event first
      const newEvent = await createEvent({
        name: values.name.trim(),
        assignmentLetter: selectedDocument.name, // Store filename as assignment letter for backward compatibility
      });

      // Upload document
      const uploadedDocument = await uploadEventDocument(
        selectedDocument,
        newEvent.id,
        "assignment_letter"
      );

      // Save document reference to database
      await saveEventDocument(uploadedDocument, newEvent.id);

      // Reset form and close dialog
      reset();
      setSelectedDocument(null);
      setOpen(false);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Error creating event. Please try again.");
    }
  };

  const handleDocumentChange = (file: File | null) => {
    if (!file) {
      return;
    }

    setSelectedDocument(file);

    setValue("document", file, { shouldValidate: true });
    setValue("assignmentLetter", file.name);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      reset();
      setSelectedDocument(null);
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Tambah Kegiatan
        </Button>
      </DialogTrigger>
      <DialogDescription className="sr-only">
        Dialog untuk membuat kegiatan baru
      </DialogDescription>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Kegiatan Baru</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="event">Nama Kegiatan</FormLabel>
                  <FormControl>
                    <Input {...field} id="event" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document"
              render={() => (
                <FormItem>
                  <FormLabel>Surat Tugas</FormLabel>
                  <FormControl>
                    <DocumentUpload
                      onDocumentChange={handleDocumentChange}
                      maxSize={10}
                      required={true}
                      error={errors.document?.message?.toString()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
