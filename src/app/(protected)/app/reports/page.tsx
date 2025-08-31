import ReportGenerator from "./_components/report-generator";

export default function Page() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-xl lg:text-3xl font-bold">Buat Laporan</h1>
        <p className="text-muted-foreground">
          Pilih rentang tanggal untuk membuat laporan dari kegiatan yang telah
          selesai.
        </p>
      </header>

      <ReportGenerator />
    </>
  );
}
