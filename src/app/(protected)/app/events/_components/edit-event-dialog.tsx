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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Event } from "@/types";
import { updateEvent, saveEventDocument } from "@/services/events";
import { uploadEventDocument } from "@/services/storage";
import { Loader2, Pencil } from "lucide-react";
import { updateEventSchema } from "@/schemas";

type FormValues = z.input<typeof updateEventSchema> & {
  document?: File | undefined;
};

type EditEventDialogProps = {
  event: Event;
};

export default function EditEventDialog({ event }: EditEventDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(updateEventSchema),
    defaultValues: {
      name: event.name,
      assignmentLetter: event.assignmentLetter,
      status: event.status,
      startDate: event.startDate ?? null,
      endDate: event.endDate ?? null,
      document: undefined,
    },
    mode: "onChange",
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Update main fields
      await updateEvent(event.id, {
        name: values.name,
        assignmentLetter: values.assignmentLetter,
        status: values.status,
        startDate: values.startDate ?? null,
        endDate: values.endDate ?? null,
      });

      // If a new document is provided, upload and save metadata
      if (values.document instanceof File) {
        const uploaded = await uploadEventDocument(
          values.document,
          event.id,
          "assignment_letter"
        );
        await saveEventDocument(uploaded, event.id);
      }

      setOpen(false);
      // Simple refresh to get latest data
      window.location.reload();
    } catch (e) {
      console.error("Failed to update event", e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="size-4" />
          Edit Event
        </Button>
      </DialogTrigger>
      <DialogDescription className="sr-only">Edit event</DialogDescription>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit Kegiatan</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kegiatan</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignmentLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Surat Tugas</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document"
              render={({ field: { onChange } }) => (
                <FormItem>
                  <FormLabel>Ganti Surat Tugas (opsional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/jpeg,image/png"
                      onChange={(e) => onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !form.formState.isDirty || form.formState.isSubmitting
                }
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
