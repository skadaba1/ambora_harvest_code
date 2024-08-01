# from django.shortcuts import render
# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from openai import OpenAI
# import os
# import chromadb
# import PyPDF2
# import docx

# # Initialize ChromaDB Client
# chroma_client = chromadb.PersistentClient(path="/tmp/chroma")
# try:
#     collection = chroma_client.get_collection(name="grant_docs")
# except:
#     collection = chroma_client.create_collection(name="grant_docs")

# # OpenAI Client
# os.environ["OPENAI_API_KEY"] = "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"
# client = OpenAI()

# # OpenAI Embeddings 
# def get_openai_embeddings(texts):
#     response = client.embeddings.create(input=texts, model="text-embedding-ada-002")
#     embeddings = [data.embedding for data in response.data]
#     return embeddings

# # Function to store documents in ChromaDB
# def store_document_in_chromadb(documents):
#     embeddings = get_openai_embeddings([doc['content'] for doc in documents])
#     ids = [str(doc['id']) for doc in documents]
#     contents = [doc['content'] for doc in documents]

#     collection.upsert(
#         ids=ids,
#         embeddings=embeddings,
#         documents=contents,
#     )

# # Function to read content from PDF files
# def read_pdf(file_path):
#     content = ""
#     with open(file_path, "rb") as file:
#         reader = PyPDF2.PdfReader(file)
#         for page_num in range(len(reader.pages)):
#             page = reader.pages[page_num]
#             content += page.extract_text()
#     return content

# # Function to read content from DOCX files
# def read_docx(file_path):
#     doc = docx.Document(file_path)
#     content = ""
#     for paragraph in doc.paragraphs:
#         content += paragraph.text
#     return content

# # Function to parse and store files in ChromaDB
# def parse_and_store_files(file_paths):
#     documents = []
#     for file_path in file_paths:
#         if file_path.endswith(".pdf"):
#             content = read_pdf(file_path)
#         elif file_path.endswith(".docx"):
#             content = read_docx(file_path)
#         else:
#             continue
        
#         doc_id = os.path.basename(file_path)
#         documents.append({"id": doc_id, "content": content})
    
#     store_document_in_chromadb(documents)

# # Retrieve similar documents
# def retrieve_similar_documents(query, n_results=2):
#     query_embedding = get_openai_embeddings([query])[0]
#     results = collection.query(query_embedding, n_results=n_results)
#     return results['documents'][0]
