from langchain_ollama import OllamaEmbeddings

embeddings = OllamaEmbeddings(model="nomic-embed-text")


def create_embedding(text: str) -> list[float]:
    return embeddings.embed_query(text)
