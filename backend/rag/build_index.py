import pandas as pd
import faiss
import pickle
import os
from sentence_transformers import SentenceTransformer

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

df = pd.read_excel(os.path.join(BASE_DIR, "Bot Respond.xlsx"))

model = SentenceTransformer("all-MiniLM-L6-v2")

texts = []
for _, row in df.iterrows():
    q = str(row["Question"]).strip()
    a = str(row["Answer"]).strip()
    texts.append(f"Question: {q}\nAnswer: {a}")

embeddings = model.encode(texts)

index = faiss.IndexFlatL2(embeddings.shape[1])
index.add(embeddings)

faiss.write_index(index, os.path.join(BASE_DIR, "faiss_index.bin"))

with open(os.path.join(BASE_DIR, "metadata.pkl"), "wb") as f:
    pickle.dump(texts, f)

print("FAISS index rebuilt successfully")
