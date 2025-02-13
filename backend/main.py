import fitz  # PyMuPDF
import pytesseract
from pdf2image import convert_from_path
import os
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def extract_text_from_pdf(file: UploadFile) -> str:
    text_content = []
    file_path = f"temp_{file.filename}"

    
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    try:
        doc = fitz.open(file_path)
        for page in doc:
            text = page.get_text()
            if text.strip(): 
                text_content.append(text)
            else:
                
                images = convert_from_path(file_path, first_page=page.number+1, last_page=page.number+1)
                for img in images:
                    text = pytesseract.image_to_string(img)
                    text_content.append(text)

        doc.close()

    finally:
        os.remove(file_path)  

    print(text_content)

    return "\n".join(text_content).strip() 
