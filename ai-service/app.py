from fastapi import FastAPI, UploadFile, File
from pypdf import PdfReader
from docx import Document
import os
import shutil

app = FastAPI(title="Talmetry AI Service")


UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


def extract_pdf_text(file_path):
    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text


def extract_docx_text(file_path):
    document = Document(file_path)

    text = ""

    for paragraph in document.paragraphs:
        text += paragraph.text + "\n"

    return text


@app.get("/")
def home():
    return {
        "message": "Talmetry AI Service is running"
    }


@app.post("/api/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if file.filename.lower().endswith(".pdf"):

        resume_text = extract_pdf_text(file_path)

    elif file.filename.lower().endswith(".docx"):

        resume_text = extract_docx_text(file_path)

    else:

        return {
            "error": "Only PDF and DOCX files are supported"
        }

    return {
        "fileName": file.filename,
        "text": resume_text
    }