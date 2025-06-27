import workerSrc from 'pdfjs-dist/build/pdf.worker.entry';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
