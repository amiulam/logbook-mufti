"use client";

import { useState } from "react";
import { Tool } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, Trash2 } from "lucide-react";
import { getConditionColor } from "@/lib/utils";
import { deleteTool } from "@/services/tools";
import DeleteToolDialog from "@/app/(protected)/app/events/_components/delete-tool-dialog";

interface ToolCardProps {
  tool: Tool;
  // onDelete: (toolId: string) => void;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteTool(tool.id);
      setIsDeleteDialogOpen(false);
      // Optionally refresh the page or trigger a callback
      window.location.reload();
    } catch (error) {
      console.error("Error deleting tool:", error);
      // You could show a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Wrench className="w-5 h-5 mr-2 text-muted-foreground" />
            {tool.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteClick}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Category:</span>
            <span className="font-medium">{tool.category}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium">{tool.total}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Initial Condition:</span>
            <Badge className={getConditionColor(tool.initialCondition)}>
              {tool.initialCondition}
            </Badge>
          </div>

          {tool.finalCondition && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Final Condition:</span>
              <Badge className={getConditionColor(tool.finalCondition)}>
                {tool.finalCondition}
              </Badge>
            </div>
          )}

          {tool.notes && (
            <div className="text-sm">
              <span className="text-muted-foreground">Notes:</span>
              <p className="mt-1 text-sm bg-gray-50 p-2 rounded">
                {tool.notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <DeleteToolDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        toolName={tool.name}
        isLoading={isDeleting}
      />
    </Card>
  );
}
