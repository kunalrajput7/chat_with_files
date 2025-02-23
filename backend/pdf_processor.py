import PyPDF2

# This function returns a list of sentences extracted from the PDF.

def extract_text_from_pdf(pdf_path):  
    try:
        # Open the PDF file in read-binary mode
        with open(pdf_path, 'rb') as file:
            # Create a PDF reader object
            reader = PyPDF2.PdfReader(file)
            # Initialize an empty string to collect text
            text = ""
            # Loop through each page and extract text
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:  # Ensure there's text to add
                    text += page_text + " "
            # Split text into sentences based on period followed by space
            sentences = text.split('. ')
            # Clean up sentences (remove extra whitespace)
            sentences = [s.strip() for s in sentences if s.strip()]
            return sentences
    except Exception as e:
        print(f"Error processing PDF: {e}")
        return []

# # Test the function (optional, remove in production)
# if __name__ == "__main__":
#     sample_pdf = "Kunal(Machine_Learning_Resume).pdf"  # Replace with a real PDF path
#     sentences = extract_text_from_pdf(sample_pdf)
#     print(f"Extracted {len(sentences)} sentences:")
#     for i in range(len(sentences)):  # Print first 5
#         print(f"SENTENCE {i} --> {sentences[i]} \n\n")