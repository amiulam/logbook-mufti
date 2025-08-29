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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tool } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { TOOL_CATEGORIES, TOOL_CONDITIONS } from "@/lib/constant";
import { updateTool } from "@/services/tools";
import { Loader2, Pencil } from "lucide-react";
import { updateToolSchema } from "@/schemas";

type FormValues = z.input<typeof updateToolSchema>;

type EditToolDialogProps = {
  tool: Tool;
};

export default function EditToolDialog({ tool }: EditToolDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(updateToolSchema),
    defaultValues: {
      name: tool.name,
      category: tool.category,
      total: tool.total,
      initialCondition: tool.initialCondition,
      notes: tool.notes,
    },
    mode: "onChange",
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await updateTool(tool.id, values);
      setOpen(false);
      // Simple refresh
      window.location.reload();
    } catch (e) {
      console.error("Failed to update tool", e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="size-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogDescription className="sr-only">Edit alat</DialogDescription>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit Alat</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value as number}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value as string}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TOOL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="initialCondition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kondisi Awal</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value as string}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Kondisi Awal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TOOL_CONDITIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
