'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { createTool } from '@/services/tools';
import { Tool } from '@/types';

type AddToolModalProps = {
  eventId: number;
  // onToolAdded: (tool: Tool) => Promise<void>;
}

const TOOL_CONDITIONS = [
  { value: 'good', label: 'Good' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'needs_repair', label: 'Needs Repair' },
];

const TOOL_CATEGORIES = [
  'Hand Tools',
  'Power Tools',
  'Safety Equipment',
  'Measuring Tools',
  'Electrical',
  'Mechanical',
  'Other',
];

export default function AddToolDialog({ eventId }: AddToolModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [total, setTotal] = useState('1');
  const [initialCondition, setInitialCondition] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !category || !initialCondition || loading) return;

    setLoading(true);
    try {
      // const tool = await createTool({
      //   eventId,
      //   name: name.trim(),
      //   category,
      //   total: parseInt(total) || 1,
      //   initialCondition,
      // });

      // await onToolAdded(tool);
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating tool:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('');
    setTotal('1');
    setInitialCondition('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Tool
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Tool</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tool-name">Tool Name *</Label>
            <Input
              id="tool-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter tool name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {TOOL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="total">Total Quantity *</Label>
            <Input
              id="total"
              type="number"
              min="1"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="condition">Initial Condition *</Label>
            <Select value={initialCondition} onValueChange={setInitialCondition} required>
              <SelectTrigger>
                <SelectValue placeholder="Select initial condition" />
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
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Tool'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}