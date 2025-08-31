"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Download } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { generateReport, ReportData } from "@/services/reports";
import ReportDisplay from "./report-display";

export default function ReportGenerator() {
  const [date, setDate] = useState<DateRange | undefined>();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    if (!date?.from || !date?.to) {
      setError("Please select a date range.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setReportData(null);

    try {
      const data = await generateReport({
        from: date.from,
        to: date.to,
      });
      setReportData(data);
    } catch (err) {
      setError("Failed to generate report. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportData) return;

    setIsExporting(true);
    try {
      const { exportReportToPdf } = await import("@/lib/pdf-generator");
      exportReportToPdf(reportData);
    } catch (error) {
        console.error("Error exporting to PDF", error);
        setError("Failed to export report as PDF.");
    }
    finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="border rounded-lg p-6">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <Button onClick={handleGenerateReport} disabled={isLoading || !date?.from || !date?.to}>
          {isLoading ? "Memproses..." : "Tampilkan Laporan"}
        </Button>
        {reportData && (
          <Button onClick={handleExportPDF} disabled={isExporting} variant="outline">
            <Download className="size-4" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
        )}
      </div>

      {error && <p className="text-destructive mt-4">{error}</p>}
      
      {reportData && (
        <div className="mt-8">
            <ReportDisplay data={reportData} />
        </div>
      )}
    </div>
  );
}
