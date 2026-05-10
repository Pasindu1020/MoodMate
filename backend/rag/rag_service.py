import faiss
import pickle
import sys
import json
import os
import re
from sentence_transformers import SentenceTransformer

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

index = faiss.read_index(os.path.join(BASE_DIR, "faiss_index.bin"))
with open(os.path.join(BASE_DIR, "metadata.pkl"), "rb") as f:
    documents = pickle.load(f)

model = SentenceTransformer("all-MiniLM-L6-v2")

def normalize(text):
    text = text.lower().replace("’", "'")
    text = re.sub(r"[^a-z0-9\s]", "", text)
    return text.strip()

def tokens(text):
    return set(normalize(text).split())

def extract_answer(raw):
    text = raw.strip()
    lower = text.lower()

    if "answer:" in lower:
        idx = lower.index("answer:")
        return text[idx + len("answer:"):].strip()

    return text

query_raw = sys.argv[1]
query = normalize(query_raw)
query_tokens = tokens(query_raw)


for d in documents:
    text_raw = str(d)
    text = normalize(text_raw)

    if query in text or text in query:
        answer = extract_answer(text_raw)

        print(json.dumps({
            "status": "FOUND",
            "reply": answer
        }))
        sys.exit(0)


BEST_OVERLAP = 0
BEST_DOC = None

for d in documents:
    text_raw = str(d)
    doc_tokens = tokens(text_raw)

    if not doc_tokens:
        continue

    overlap = len(query_tokens & doc_tokens) / max(len(query_tokens), 1)

    if overlap > BEST_OVERLAP:
        BEST_OVERLAP = overlap
        BEST_DOC = text_raw

if BEST_OVERLAP >= 0.5 and BEST_DOC:
    answer = extract_answer(BEST_DOC)

    print(json.dumps({
        "status": "FOUND",
        "reply": answer
    }))
    sys.exit(0)


query_vec = model.encode([query]).astype("float32")
D, I = index.search(query_vec, 1)

distance = float(D[0][0])
idx = int(I[0][0])

MAX_DISTANCE = 0.70

if distance > MAX_DISTANCE:
    print(json.dumps({ "status": "NOT_FOUND" }))
    sys.exit(0)

raw = str(documents[idx])
answer = extract_answer(raw)

if not answer:
    print(json.dumps({ "status": "NOT_FOUND" }))
    sys.exit(0)

print(json.dumps({
    "status": "FOUND",
    "reply": answer
}))
