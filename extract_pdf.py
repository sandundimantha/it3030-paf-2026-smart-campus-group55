import fitz
import sys
import os

files = ['PAF_Assignment-2026.pdf', 'IT3030_PAF_2026_Marking_Rubric.pdf']

with open('parsed_pdfs.md', 'w', encoding='utf-8') as f:
    for file in files:
        f.write(f"\n\n# --- CONTENTS OF {file} ---\n\n")
        try:
            doc = fitz.open(file)
            for page in doc:
                f.write(page.get_text())
                f.write("\n")
            doc.close()
        except Exception as e:
            f.write(f"Error reading {file}: {e}\n")

print("Done extracting text.")
