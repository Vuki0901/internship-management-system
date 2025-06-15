import { Injectable } from '@angular/core';

export interface PdfDownloadResponse {
  fileName: string;
  contentBase64: string;
  mimeType: string;
  fileSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class PdfDownloadService {

  /**
   * Downloads a PDF file from base64 content
   * @param pdfResponse The PDF response containing base64 content and metadata
   */
  downloadPdf(pdfResponse: PdfDownloadResponse): void {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(pdfResponse.contentBase64);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: pdfResponse.mimeType });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfResponse.fileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw new Error('Failed to download PDF file');
    }
  }

  /**
   * Opens a PDF file in a new tab from base64 content
   * @param pdfResponse The PDF response containing base64 content and metadata
   */
  openPdfInNewTab(pdfResponse: PdfDownloadResponse): void {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(pdfResponse.contentBase64);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: pdfResponse.mimeType });

      // Create URL and open in new tab
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Note: We don't revoke the URL immediately as the new tab needs it
      // The browser will handle cleanup when the tab is closed
    } catch (error) {
      console.error('Error opening PDF:', error);
      throw new Error('Failed to open PDF file');
    }
  }
} 