"""Embedding service using ChromaDB and Gemini embeddings."""
import uuid
from typing import List, Dict, Any, Optional
from pathlib import Path

import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document

from app.core.config import settings


class EmbeddingService:
    """Service for generating embeddings and managing vector storage."""

    def __init__(self):
        """Initialize the embedding service."""
        self._client = None
        self._embeddings = None

    @property
    def client(self) -> chromadb.PersistentClient:
        """Get or create ChromaDB client."""
        if self._client is None:
            # Ensure directory exists
            db_path = Path(settings.chroma_db_path)
            db_path.mkdir(parents=True, exist_ok=True)
            
            self._client = chromadb.PersistentClient(
                path=str(db_path),
                settings=ChromaSettings(
                    anonymized_telemetry=False,
                    allow_reset=True,
                )
            )
        return self._client

    @property
    def embeddings(self) -> GoogleGenerativeAIEmbeddings:
        """Get or create Gemini embeddings model."""
        if self._embeddings is None:
            self._embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=settings.gemini_api_key,
                task_type="retrieval_document"
            )
        return self._embeddings

    def create_collection(self, user_id: str) -> str:
        """Create a new collection for a user."""
        collection_id = f"cv_{user_id}_{uuid.uuid4().hex[:8]}"
        
        self.client.create_collection(
            name=collection_id,
            metadata={"user_id": user_id},
            get_or_create=True
        )
        
        return collection_id

    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """Split text into overlapping chunks for better retrieval."""
        # Simple character-based chunking
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            
            # Try to break at sentence boundary
            if end < len(text):
                last_period = chunk.rfind('.')
                last_newline = chunk.rfind('\n')
                break_point = max(last_period, last_newline)
                
                if break_point > chunk_size // 2:
                    chunk = chunk[:break_point + 1]
                    end = start + break_point + 1
            
            chunks.append(chunk.strip())
            start = end - overlap
        
        return [c for c in chunks if len(c) > 50]  # Filter very short chunks

    async def add_cv_to_vector_store(
        self, 
        user_id: str,
        collection_id: str,
        cv_data: Dict[str, Any],
        raw_text: str
    ) -> int:
        """Add CV content to vector store."""
        # Chunk the CV text
        chunks = self.chunk_text(raw_text)
        
        # Create documents with metadata
        documents = []
        metadatas = []
        ids = []
        
        # Create chunks by section
        for section, content in cv_data.items():
            if isinstance(content, list):
                for i, item in enumerate(content):
                    if isinstance(item, dict):
                        text = item.get("raw", str(item))
                    else:
                        text = str(item)
                    if len(text) > 50:
                        chunks.append(text)
        
        # Add general chunks
        for idx, chunk in enumerate(chunks):
            documents.append(chunk)
            metadatas.append({
                "user_id": user_id,
                "section": section if 'section' in dir() else "general",
                "chunk_index": idx
            })
            ids.append(f"chunk_{uuid.uuid4().hex[:8]}")
        
        # Add to ChromaDB
        collection = self.client.get_collection(collection_id)
        
        # Generate embeddings using Gemini
        embedding_vectors = self.embeddings.embed_documents(documents)
        
        collection.add(
            documents=documents,
            embeddings=embedding_vectors,
            metadatas=metadatas,
            ids=ids
        )
        
        return len(documents)

    async def similarity_search(
        self,
        collection_id: str,
        query: str,
        k: int = 5,
        filter_metadata: Optional[Dict] = None
    ) -> List[Dict[str, Any]]:
        """Search for similar content in the vector store."""
        collection = self.client.get_collection(collection_id)
        
        # Generate query embedding
        query_embedding = self.embeddings.embed_query(query)
        
        # Search
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=k,
            where=filter_metadata
        )
        
        # Format results
        formatted_results = []
        if results["documents"] and results["documents"][0]:
            for i, doc in enumerate(results["documents"][0]):
                formatted_results.append({
                    "content": doc,
                    "distance": results["distances"][0][i] if "distances" in results else 0,
                    "metadata": results["metadatas"][0][i] if "metadatas" in results else {}
                })
        
        return formatted_results

    async def delete_collection(self, collection_id: str) -> bool:
        """Delete a vector collection."""
        try:
            self.client.delete_collection(collection_id)
            return True
        except Exception:
            return False

    async def reset(self) -> bool:
        """Reset the entire vector store (use with caution)."""
        try:
            self.client.reset()
            return True
        except Exception:
            return False


# Singleton instance
embedding_service = EmbeddingService()
