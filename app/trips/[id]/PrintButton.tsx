"use client";

import { jsPDF } from "jspdf";

interface Props {
  title: string;
  itinerary: string;
  dateRange?: string;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")   // headings
    .replace(/\*\*(.+?)\*\*/g, "$1") // bold
    .replace(/\*(.+?)\*/g, "$1")     // italic
    .replace(/^[-*]\s+/gm, "• ")    // bullet points
    .replace(/`(.+?)`/g, "$1");      // inline code
}

export default function PrintButton({ title, itinerary, dateRange }: Props) {
  function handleDownload() {
    const doc = new jsPDF({ unit: "pt", format: "letter" });

    const margin = 50;
    const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = margin;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, y);
    y += 24;

    // Date range
    if (dateRange) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(dateRange, margin, y);
      y += 20;
      doc.setTextColor(0);
    }

    y += 8;

    // Itinerary body
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const cleaned = stripMarkdown(itinerary);
    const lines = doc.splitTextToSize(cleaned, maxWidth) as string[];
    const lineHeight = 15;

    for (const line of lines) {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }

    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
  }

  return (
    <button
      onClick={handleDownload}
      className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
    >
      Download PDF
    </button>
  );
}
