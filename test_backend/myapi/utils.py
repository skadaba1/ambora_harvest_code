import PyPDF2
import pdfplumber
import docx
import json

from langchain_text_splitters import RecursiveCharacterTextSplitter

# Initialize the text splitter with custom parameters
custom_text_splitter = RecursiveCharacterTextSplitter(
    # Set custom chunk size
    chunk_size = 1024,
    chunk_overlap  = 16,
    # Use length of the text as the size measure
    length_function = len,
    )

# function to delete all nodes and relationships in neo4j
def clear_neo4j(driver):
    with driver.session() as session:
        session.run("MATCH(n) DETACH DELETE n")

# extracts words from pdf
def extract_text_from_pdf(pdf_path):
    page_texts = []
    with pdfplumber.open(pdf_path) as pdf:
        page_texts = [page.extract_text() for page in pdf.pages]
        return " ".join(page_texts)
    

# OpenAI Embeddings 
def get_openai_embeddings(texts, embeddings):
    doc_result = embeddings.embed_documents(texts)
    return doc_result

# Function to read content from PDF files
def read_pdf(file_path):
    content = ""
    with open(file_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        for page_num in range(len(reader.pages)):
            page = reader.pages[page_num]
            content += page.extract_text()
    return content

# Function to read content from DOCX files
def read_docx(file_path):
    doc = docx.Document(file_path)
    content = ""
    for paragraph in doc.paragraphs:
        content += paragraph.text
    return content

# Function to chunk text using langchain's text_splitter
def chunk_text(sample):
    texts = custom_text_splitter.create_documents([sample])
    return texts

def extract_questions(client, file_path, provided_questions):

    if(not file_path):
        out = [{"description":q, "word_limit":None, "page_limit":None} for q in provided_questions]
        return {'questions': out}
    
    if(file_path.endswith('.pdf')):
        text = extract_text_from_pdf(file_path)
    elif(file_path.endswith('.docx')):
        text = read_docx(file_path)

    # Make a completion request referencing the uploaded file
    extraction_prompt = """ Given the following PDF text, \n 
    BEGINNING OF PDF:  \n 
    ********************************************************* \n
    {} \n
    ********************************************************* \n
    END OF PDF \n, 
    generate a JSON output which contains a list of 'Question' objects.
    Each question should contain a 1) description of what the question is asking, 
    2) any mention of word count limit or (None if no mention), must be an integer, no text and 
    3) any mention of page limit (None if no mention), must be an integer, no text. 
    Return a JSON object for all questions which require a essay or short-answer response.
    """.format(text, provided_questions)
    example = """\nYour return should be a JSON object for example a document with 1 question might produce the following output: \n
    {'questions':[\n
        {"description": "Describe your organization or project goals", "word_limit": 1000, "page_limit": 3},\n
    ]}"""
    extraction_prompt += example
    completion = client.chat.completions.create(
    model="gpt-4-1106-preview",
    messages=[
        {"role": "system", "content": "You are a helpful assistant that can read PDFs and extract the relevant requested information in JSON. \
         You must follow the users instructions without adding any unwanted elements or keys to the final json object."},
        {"role": "user", "content": extraction_prompt}
    ],
    response_format={"type": "json_object"}
    )
    questions = json.loads(completion.choices[0].message.content)
    questions['questions'] = [{"description":q, "word_limit":None, "page_limit":None} for q in provided_questions if len(q) > 5] + questions['questions'] # just to make sure lone characters don't sneak in there
    print("QUESTIONS: ", questions)
    return questions
