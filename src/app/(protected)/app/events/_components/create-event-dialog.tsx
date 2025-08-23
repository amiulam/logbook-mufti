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
import { Plus } from "lucide-react";
import { createEvent } from "@/services/events";
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

export default function CreateEventModal() {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof eventInsertSchema>>({
    resolver: zodResolver(eventInsertSchema),
    defaultValues: {
      name: "",
      assignmentLetter: "",
    },
  });

  const {
    reset,
    formState: { isSubmitting, isDirty },
  } = form;

  const onSubmit = async (values: z.infer<typeof eventInsertSchema>) => {
    console.log(values);

    try {
      const event = await createEvent({
        name: values.name.trim(),
        assignmentLetter: values.assignmentLetter.trim(),
        status: "not_started",
      });

      console.log(event);
      reset();
      
      setOpen(false);
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Tambah Kegiatan
        </Button>
      </DialogTrigger>
      <DialogDescription className="sr-only">
        Dialog untuk membuat kegiatan baru
      </DialogDescription>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Kegiatan Baru</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="assignmentLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="assignment_letter">Surat Tugas</FormLabel>
                  <FormControl>
                    <Input {...field} id="assignment_letter" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                Submit
              </Button>
            </div>
          </form>
        </Form>
        {/* <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter event name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignment">Assignment Letter</Label>
            <Input
              id="assignment"
              value={assignmentLetter}
              onChange={(e) => setAssignmentLetter(e.target.value)}
              placeholder="Enter assignment letter (optional)"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form> */}
      </DialogContent>
    </Dialog>
  );
}
