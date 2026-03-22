const fs = require('fs');
const pdf = require('pdf-parse');

async function readPdfs() {
    const files = ['PAF_Assignment-2026.pdf', 'IT3030_PAF_2026_Marking_Rubric.pdf'];
    let output = '';
    for (const file of files) {
        output += `\n\n--- CONTENTS OF ${file} ---\n\n`;
        try {
            const dataBuffer = fs.readFileSync(file);
            const data = await pdf(dataBuffer);
            output += data.text;
        } catch (error) {
            output += `Error reading ${file}: ${error.message}\n`;
        }
    }
    fs.writeFileSync('parsed_pdfs.md', output);
}

readPdfs();
