import os
import re

try:
    import pymupdf as fitz
except ImportError:
    try:
        import fitz
    except ImportError:
        fitz = None

try:
    import pypdf
except ImportError:
    pypdf = None

try:
    import docx
except ImportError:
    docx = None

class DocumentExtractor:
    """Extracts raw text and metadata from PDF and DOCX files."""

    @staticmethod
    def extract_text(file_path: str) -> str:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        ext = os.path.splitext(file_path)[1].lower()

        if ext == ".pdf":
            return DocumentExtractor._extract_from_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            return DocumentExtractor._extract_from_docx(file_path)
        elif ext in [".txt", ".md"]:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        else:
            raise ValueError(f"Unsupported file format: {ext}. Only PDF, DOCX, and TXT are supported.")

    @staticmethod
    def _extract_from_pdf(file_path: str) -> str:
        text = ""
        if fitz is not None:
            try:
                doc = fitz.open(file_path)
                pages_text = [page.get_text() for page in doc]
                text = "\n".join(pages_text)
                if text.strip():
                    return DocumentExtractor._clean_raw_text(text)
            except Exception as e:
                print(f"[Warning] PyMuPDF failed: {e}. Falling back to pypdf.")

        if pypdf is not None:
            try:
                reader = pypdf.PdfReader(file_path)
                pages_text = [page.extract_text() for page in reader.pages if page.extract_text()]
                text = "\n".join(pages_text)
                if text.strip():
                    return DocumentExtractor._clean_raw_text(text)
            except Exception as e:
                print(f"[Error] pypdf failed: {e}")

        if not text.strip():
            raise ValueError("Could not extract readable text from PDF file. It might be empty or image-only scanned.")

        return DocumentExtractor._clean_raw_text(text)

    @staticmethod
    def _extract_from_docx(file_path: str) -> str:
        if docx is None:
            raise RuntimeError("python-docx package is not installed.")

        try:
            doc = docx.Document(file_path)
            full_text = [para.text for para in doc.paragraphs if para.text]
            for table in doc.tables:
                for row in table.rows:
                    row_text = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                    if row_text:
                        full_text.append(" | ".join(row_text))
            
            text = "\n".join(full_text)
            if not text.strip():
                raise ValueError("DOCX document is empty.")
            return DocumentExtractor._clean_raw_text(text)
        except Exception as e:
            raise ValueError(f"Error parsing DOCX file: {str(e)}")

    @staticmethod
    def _clean_raw_text(text: str) -> str:
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', text)
        lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in text.split('\n')]
        return "\n".join(lines)
