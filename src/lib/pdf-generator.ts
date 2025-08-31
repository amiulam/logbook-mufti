import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ReportData } from "@/services/reports";
import { format } from "date-fns";

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  autoTable: (options: any) => jsPDF;
}

export const exportReportToPdf = (data: ReportData) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageHeight = doc.internal.pageSize.height;
  let yPos = 20; // Initial y position

  // === 1. DOCUMENT TITLE ===
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Laporan Kegiatan", 105, yPos, { align: "center" });
  yPos += 8;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const formattedStartDate = format(new Date(data.startDate), "dd MMMM yyyy");
  const formattedEndDate = format(new Date(data.endDate), "dd MMMM yyyy");
  doc.text(
    `Periode: ${formattedStartDate} - ${formattedEndDate}`,
    105,
    yPos,
    { align: "center" },
  );
  yPos += 20;

  // === 2. REPORT SUMMARY ===
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan Laporan", 14, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Kegiatan Dilayani: ${data.totalEvents}`, 14, yPos);
  yPos += 7;
  doc.text(`Total Peralatan Digunakan: ${data.totalItemsDeployed}`, 14, yPos);
  yPos += 15;
  
  const checkYPos = (currentY: number) => {
    if (currentY > pageHeight - 30) { // 30 is a margin
      doc.addPage();
      return 20; // Reset yPos for new page
    }
    return currentY;
  };

  // === 3. ALL TOOLS USAGE DETAILS ===
  yPos = checkYPos(yPos);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Rincian Penggunaan Alat", 14, yPos);
  yPos += 10;

  autoTable(doc, {
    startY: yPos,
    head: [
      ["No", "Kategori", "Nama Alat", "Event", "Kondisi Akhir", "Keterangan"],
    ],
    body: data.allTools.map((tool, index) => [
      index + 1,
      tool.category,
      tool.toolName,
      tool.eventName,
      tool.finalCondition || tool.initialCondition,
      tool.notes || "-",
    ]),
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
    didDrawPage: (data) => { yPos = data.cursor?.y || 20; }
  });

  // === 4. CATEGORY INSIGHTS ===
  yPos = checkYPos(yPos + 10);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Wawasan Kategori", 14, yPos);
  yPos += 10;

  const totalUsageCount = Object.values(data.categoryInsights).reduce(
    (acc, curr) => acc + curr.usageCount,
    0,
  );

  autoTable(doc, {
    startY: yPos,
    head: [
      [
        "Kategori",
        "Frekuensi",
        "% Penggunaan",
        "Jumlah Item",
        "Item Rusak",
      ],
    ],
    body: Object.entries(data.categoryInsights)
      .sort(([, a], [, b]) => b.usageCount - a.usageCount)
      .map(([category, insights]) => [
        category,
        insights.usageCount,
        `${((insights.usageCount / totalUsageCount) * 100).toFixed(1)}%`,
        insights.itemsDeployed,
        insights.damagedCount,
      ]),
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
    didDrawPage: (data) => { yPos = data.cursor?.y || 20; }
  });
  
  // === 5. DAMAGED TOOLS REPORT ===
  if (data.damagedTools.length > 0) {
    yPos = checkYPos(yPos + 10);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Laporan Alat Rusak & Tidak Wajar", 14, yPos);
    yPos += 10;
    
    autoTable(doc, {
        startY: yPos,
        head: [
            ["Kegiatan", "Nama Alat", "Kategori", "Kondisi Awal", "Kondisi Akhir"],
        ],
        body: data.damagedTools.map(tool => [
            tool.eventName,
            tool.toolName,
            tool.category,
            tool.initialCondition,
            tool.finalCondition,
        ]),
        theme: "striped",
        headStyles: { fillColor: [231, 76, 60] },
        didDrawPage: (data) => { yPos = data.cursor?.y || 20; }
    });
  }

  doc.save(`laporan-kegiatan-${data.startDate}-sd-${data.endDate}.pdf`);
};
