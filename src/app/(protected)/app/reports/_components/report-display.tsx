import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportData } from "@/services/reports";

interface ReportDisplayProps {
  data: ReportData;
}

export default function ReportDisplay({ data }: ReportDisplayProps) {
  const totalUsageCount = Object.values(data.categoryInsights).reduce(
    (acc, curr) => acc + curr.usageCount,
    0,
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Laporan</CardTitle>
          <CardDescription>
            Menampilkan hasil untuk kegiatan yang selesai dari tanggal{" "}
            <strong>{data.startDate}</strong> hingga{" "}
            <strong>{data.endDate}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{data.totalEvents}</CardTitle>
                <CardDescription>Total Kegiatan Dilayani</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{data.totalItemsDeployed}</CardTitle>
                <CardDescription>Total Peralatan Digunakan</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rincian Penggunaan Alat</CardTitle>
          <CardDescription>
            Daftar lengkap semua peralatan yang digunakan dalam periode laporan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Nama Alat</TableHead>
                <TableHead>Event Terkait</TableHead>
                <TableHead>Kondisi Akhir</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.allTools.length > 0 ? (
                data.allTools.map((tool, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{tool.category}</TableCell>
                    <TableCell className="font-medium">
                      {tool.toolName}
                    </TableCell>
                    <TableCell>{tool.eventName}</TableCell>
                    <TableCell>
                      {tool.finalCondition || tool.initialCondition}
                    </TableCell>
                    <TableCell>{tool.notes || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Tidak ada peralatan yang digunakan pada periode ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wawasan Kategori</CardTitle>
          <CardDescription>
            Rincian penggunaan peralatan berdasarkan kategori.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">
                  Frekuensi Penggunaan
                </TableHead>
                <TableHead className="text-right">% Penggunaan</TableHead>
                <TableHead className="text-right">Jumlah Item</TableHead>
                <TableHead className="text-right">Item Rusak</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(data.categoryInsights).length > 0 ? (
                Object.entries(data.categoryInsights)
                  .sort(([, a], [, b]) => b.usageCount - a.usageCount)
                  .map(([category, insights]) => (
                    <TableRow key={category}>
                      <TableCell className="font-medium">{category}</TableCell>
                      <TableCell className="text-right">
                        {insights.usageCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {(
                          (insights.usageCount / totalUsageCount) *
                          100
                        ).toFixed(1)}
                        %
                      </TableCell>
                      <TableCell className="text-right">
                        {insights.itemsDeployed}
                      </TableCell>
                      <TableCell className="text-right">
                        {insights.damagedCount > 0 ? (
                          <span className="text-destructive font-bold">
                            {insights.damagedCount}
                          </span>
                        ) : (
                          insights.damagedCount
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Tidak ada data kategori untuk periode ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Laporan Alat Rusak & Tidak Wajar</CardTitle>
          <CardDescription>
            Daftar peralatan dengan kondisi akhir yang berbeda dari kondisi
            awal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kegiatan</TableHead>
                <TableHead>Nama Alat</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Kondisi Awal</TableHead>
                <TableHead>Kondisi Akhir</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.damagedTools.length > 0 ? (
                data.damagedTools.map((tool, index) => (
                  <TableRow key={index}>
                    <TableCell>{tool.eventName}</TableCell>
                    <TableCell className="font-medium">
                      {tool.toolName}
                    </TableCell>
                    <TableCell>{tool.category}</TableCell>
                    <TableCell>{tool.initialCondition}</TableCell>
                    <TableCell className="text-destructive font-semibold">
                      {tool.finalCondition}
                    </TableCell>
                    <TableCell>{tool.notes || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Tidak ada alat rusak yang tercatat pada periode ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
