(() => {
  const pdfButton = document.getElementById("downloadPdfBtn");
  if (!pdfButton) return;

  const defaultLabel = pdfButton.innerHTML;

  async function downloadPdf() {
    if (pdfButton.disabled) return;

    pdfButton.disabled = true;
    pdfButton.classList.add("loading");
    pdfButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Generating PDF...</span>';

    const docElement = document.querySelector(".document");

    try {
      if (typeof html2pdf === "undefined") {
        throw new Error("html2pdf library not loaded");
      }

      document.body.classList.add("pdf-mode");

      const options = {
        margin: 0,
        filename: "photography-system-presentation.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      };

      await html2pdf().set(options).from(docElement).save();
    } catch (error) {
      console.error("PDF generation failed:", error);
      window.print();
    } finally {
      document.body.classList.remove("pdf-mode");
      pdfButton.disabled = false;
      pdfButton.classList.remove("loading");
      pdfButton.innerHTML = defaultLabel;
    }
  }

  pdfButton.addEventListener("click", downloadPdf);
})();
