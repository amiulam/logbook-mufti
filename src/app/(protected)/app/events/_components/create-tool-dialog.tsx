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
import { Plus, Loader2 } from "lucide-react";
import { createTool, saveToolImages } from "@/services/tools";
import { uploadToolImages } from "@/services/storage";
import { useForm } from "react-hook-form";
import z from "zod";
import { addToolSchema } from "@/../drizzle/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { TOOL_CATEGORIES, TOOL_CONDITIONS } from "@/lib/constant";
import ImageUpload from "@/components/image-upload";

type AddToolModalProps = {
  eventId: number;
};

export default function CreateToolDialog({ eventId }: AddToolModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm<z.infer<typeof addToolSchema>>({
    resolver: zodResolver(addToolSchema),
    defaultValues: {
      name: "",
      category: undefined,
      initialCondition: undefined,
      total: "",
      images: [], // Add default value for images
    },
  });
  
  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting, isDirty, errors },
  } = form;

  const onSubmit = async (values: z.infer<typeof addToolSchema>) => {
    try {
      setIsUploading(true);
      
      // Create tool first
      const newTool = await createTool(values, eventId);
      
      // Upload images if any
      if (selectedImages.length > 0) {
        const uploadedImages = await uploadToolImages(selectedImages, newTool.id, 'initial');
        
        // Save image references to database
        await saveToolImages(newTool.id, uploadedImages);
      }
      
      // Reset form and close dialog
      reset();
      setSelectedImages([]);
      setOpen(false);
    } catch (error) {
      console.error("Error creating tool:", error);
      // You might want to show a toast notification here
    } finally {
      setIsUploading(false);
    }
  };

  const handleImagesChange = (images: File[]) => {
    setSelectedImages(images);
    // Update form value for validation
    setValue("images", images, { shouldValidate: true });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      reset();
      setSelectedImages([]);
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="size-4" />
          Tambahkan Alat
        </Button>
      </DialogTrigger>
      <DialogDescription className="sr-only">
        Dialog untuk menambahkan tool ke sebuah kegiatan
      </DialogDescription>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Tool</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="tool">Nama Alat</FormLabel>
                  <FormControl>
                    <Input {...field} id="tool" />
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
                  <FormLabel htmlFor="total">Jumlah</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" id="total" />
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
                    defaultValue={field.value}
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
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Kondisi Awal" />
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
            
            {/* Image Upload Section */}
            <FormField
              control={form.control}
              name="images"
              render={() => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Foto Kondisi Awal
                  </FormLabel>
                  <FormControl>
                    <ImageUpload 
                      onImagesChange={handleImagesChange}
                      maxImages={5}
                      required={true}
                      error={errors.images?.message}
                    />
                  </FormControl>
                  {/* <FormMessage /> */}
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting || isUploading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !isDirty}
                className="min-w-[100px]"
              >
                {isSubmitting || isUploading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    {isUploading ? 'Uploading...' : 'Submitting...'}
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
