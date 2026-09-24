-- Hibernate'in yönetmediği RAG tabloları. Uygulama her açılışta çalıştırır, bu yüzden
-- her ifade idempotent. Hibernate tablolarından sonra çalışır
-- (spring.jpa.defer-datasource-initialization=true), çünkü reading_passages'a bağlı.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS passage_chunks (
    id          BIGSERIAL PRIMARY KEY,
    passage_id  BIGINT      NOT NULL REFERENCES reading_passages (id) ON DELETE CASCADE,
    chunk_index INT         NOT NULL,
    content     TEXT        NOT NULL,
    embedding   vector(768) NOT NULL,
    UNIQUE (passage_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS passage_chunks_embedding_idx
    ON passage_chunks USING hnsw (embedding vector_cosine_ops);
