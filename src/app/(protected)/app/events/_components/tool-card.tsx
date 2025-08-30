"use client";

import { useState } from "react";
import { Event, Tool, ToolCategories } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, Trash2, Volume2, Video, Wifi, Settings } from "lucide-react";
import { getConditionColor } from "@/lib/utils";
import { deleteTool } from "@/services/tools";
import DeleteToolDialog from "@/app/(protected)/app/events/_components/delete-tool-dialog";
import ViewToolDialog from "@/app/(protected)/app/events/_components/view-tool-dialog";
import EditToolDialog from "@/app/(protected)/app/events/_components/edit-tool-dialog";

type ToolCardProps = {
  tool: Tool;
  eventStatus: Event["status"];
};

const getCategoryIcon = (category: ToolCategories) => {
  switch (category) {
    case "audio":
      return Volume2;
    case "video":
      return Video;
    case "jaringan":
      return Wifi;
    case "utility":
      return Wrench;
    default:
      return Settings;
  }
};

export default function ToolCard({ tool, eventStatus }: ToolCardProps) {
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
    } catch (error) {
      console.error("Error deleting tool:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const CategoryIcon = getCategoryIcon(tool.category as ToolCategories);

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold flex items-center">
            <CategoryIcon className="w-5 h-5 mr-2 text-muted-foreground" />
            {tool.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            {eventStatus != "completed" && <EditToolDialog tool={tool} />}
            <ViewToolDialog tool={tool} />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
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
