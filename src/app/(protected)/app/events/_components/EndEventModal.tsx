'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tool } from '@/types';
import { updateToolConditions } from '@/services/tools';

interface EndEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tools: Tool[];
  onConfirm: () => void;
}

const TOOL_CONDITIONS = [
  { value: 'good', label: 'Good' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'missing', label: 'Missing' },
  { value: 'needs_repair', label: 'Needs Repair' },
];

export default function EndEventModal({ open, onOpenChange, tools, onConfirm }: EndEventModalProps) {
  const [toolConditions, setToolConditions] = useState<Record<string, { condition: string; notes: string }>>({});
  const [loading, setLoading] = useState(false);

  const handleConditionChange = (toolId: string, condition: string) => {
    setToolConditions(prev => ({
      ...prev,
      [toolId]: { ...prev[toolId], condition }
    }));
  };

  const handleNotesChange = (toolId: string, notes: string) => {
    setToolConditions(prev => ({
      ...prev,
      [toolId]: { ...prev[toolId], notes }
    }));
  };

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const updates = tools.map(tool => ({
        toolId: tool.id,
        finalCondition: toolConditions[tool.id]?.condition || tool.initialCondition,
        notes: toolConditions[tool.id]?.notes || undefined,
      }));

      await updateToolConditions(updates);
      await onConfirm();
      setToolConditions({});
    } catch (error) {
      console.error('Error updating tool conditions:', error);
    } finally {
      setLoading(false);
    }
  };

  const allConditionsSet = tools.every(tool => 
    toolConditions[tool.id]?.condition || tool.initialCondition
  );

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'damaged':
        return 'bg-orange-100 text-orange-800';
      case 'missing':
        return 'bg-red-100 text-red-800';
      case 'needs_repair':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Check Tool Conditions Before Ending Event</DialogTitle>
        </DialogHeader>
        
        {tools.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No tools assigned to this event.
          </div>
        ) : (
          <div className="space-y-6">
            {tools.map((tool) => (
              <div key={tool.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{tool.name}</h3>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>Category: {tool.category}</div>
                    <div>Quantity: {tool.total}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Initial Condition:</span>
                  <Badge className={getConditionColor(tool.initialCondition)}>
                    {tool.initialCondition}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <Label>Final Condition *</Label>
                  <Select
                    value={toolConditions[tool.id]?.condition || ''}
                    onValueChange={(value) => handleConditionChange(tool.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select final condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {TOOL_CONDITIONS.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    value={toolConditions[tool.id]?.notes || ''}
                    onChange={(e) => handleNotesChange(tool.id, e.target.value)}
                    placeholder="Add any notes about the tool condition..."
                    rows={2}
                  />
                </div>
              </div>
            ))}
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!allConditionsSet || loading}
                variant="destructive"
              >
                {loading ? 'Ending Event...' : 'End Event'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}