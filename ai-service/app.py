from fastapi import FastAPI, UploadFile, File
from pypdf import PdfReader
from docx import Document
import os
import shutil
import re

# OCR imports
import fitz
import pytesseract
from PIL import Image


app = FastAPI(title="Talmetry AI Service")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# -----------------------------
# TESSERACT CONFIGURATION
# -----------------------------

TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

if os.path.exists(TESSERACT_PATH):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


# -----------------------------
# TEXT EXTRACTION
# -----------------------------

def extract_pdf_text(file_path):
    """
    First try normal PDF text extraction.
    If little/no text is found, use OCR.
    """

    # -------------------------
    # STEP 1: Normal extraction
    # -------------------------

    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    # If enough text was extracted,
    # no OCR is required.
    if len(text.strip()) > 100:
        print("Normal PDF text extraction successful.")
        print("Extracted text length:", len(text))
        return text

    # -------------------------
    # STEP 2: OCR FALLBACK
    # -------------------------

    print("Little/no text found in PDF.")
    print("Starting OCR...")

    ocr_text = ""

    pdf = fitz.open(file_path)

    for page_number, page in enumerate(pdf):

        print(f"OCR processing page {page_number + 1}...")

        # Render PDF page as image
        pix = page.get_pixmap(
            matrix=fitz.Matrix(2, 2)
        )

        image = Image.frombytes(
            "RGB",
            [pix.width, pix.height],
            pix.samples
        )

        # Run Tesseract OCR
        page_text = pytesseract.image_to_string(
            image,
            config="--psm 6"
        )

        if page_text:
            ocr_text += page_text + "\n"

    pdf.close()

    print("OCR completed.")
    print("OCR text length:", len(ocr_text))

    return ocr_text


def extract_docx_text(file_path):

    document = Document(file_path)

    text = ""

    for paragraph in document.paragraphs:
        text += paragraph.text + "\n"

    return text


# -----------------------------
# SKILL EXTRACTION
# -----------------------------

SKILLS = [
    "Java",
    "Python",
    "JavaScript",
    "React",
    "Node.js",
    "Spring Boot",
    "SQL",
    "PostgreSQL",
    "MongoDB",
    "HTML",
    "CSS",
    "Git",
    "GitHub",
    "Docker",
    "AWS",
    "Machine Learning",
    "Deep Learning",
    "Computer Vision",
    "Data Science",
    "C++",
    "C",
]


def extract_skills(text):

    found_skills = []

    text_lower = text.lower()

    for skill in SKILLS:

        if skill.lower() in text_lower:
            found_skills.append(skill)

    return found_skills


# -----------------------------
# ATS SCORE
# -----------------------------

def calculate_ats_score(text):

    score = 0

    text_lower = text.lower()

    # Basic resume content
    if len(text.strip()) > 300:
        score += 20

    # Sections
    sections = [
        "education",
        "experience",
        "skills",
        "projects",
        "contact"
    ]

    for section in sections:

        if section in text_lower:
            score += 10

    # Skills
    skills = extract_skills(text)

    score += min(len(skills) * 3, 20)

    # Limit score
    score = min(score, 100)

    return score


# -----------------------------
# RESUME ANALYSIS
# -----------------------------

def analyze_resume_text(text):

    skills = extract_skills(text)

    ats_score = calculate_ats_score(text)

    strengths = []

    weaknesses = []

    suggestions = []


    # -------------------------
    # Strengths
    # -------------------------

    if len(skills) >= 5:

        strengths.append(
            "Good technical skill coverage"
        )

    if "projects" in text.lower():

        strengths.append(
            "Projects section is present"
        )

    if "experience" in text.lower():

        strengths.append(
            "Experience section is present"
        )


    # -------------------------
    # Weaknesses
    # -------------------------

    if len(skills) < 3:

        weaknesses.append(
            "Technical skills section needs improvement"
        )

    if "projects" not in text.lower():

        weaknesses.append(
            "Projects section is missing"
        )

    if "experience" not in text.lower():

        weaknesses.append(
            "Experience section is missing"
        )


    # -------------------------
    # Suggestions
    # -------------------------

    if len(skills) < 5:

        suggestions.append(
            "Add more relevant technical skills"
        )

    if "projects" not in text.lower():

        suggestions.append(
            "Add 2-3 strong projects"
        )

    suggestions.append(
        "Use job-specific keywords to improve ATS matching"
    )


    return {
        "atsScore": ats_score,
        "skills": skills,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggestions": suggestions
    }


# -----------------------------
# API
# -----------------------------

@app.get("/")
def home():

    return {
        "message": "Talmetry AI Service is running"
    }


@app.post("/api/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):

    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    # Save uploaded file
    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )


    # -------------------------
    # Extract text
    # -------------------------

    if file.filename.lower().endswith(".pdf"):

        resume_text = extract_pdf_text(
            file_path
        )

    elif file.filename.lower().endswith(".docx"):

        resume_text = extract_docx_text(
            file_path
        )

    else:

        return {
            "error": "Only PDF and DOCX files are supported"
        }


    # -------------------------
    # Analyze resume
    # -------------------------

    analysis = analyze_resume_text(
        resume_text
    )


    # -------------------------
    # Final response
    # -------------------------

    return {
        "fileName": file.filename,
        "textLength": len(resume_text),
        **analysis
    }