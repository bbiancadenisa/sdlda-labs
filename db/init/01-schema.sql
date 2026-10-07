-- Runs automatically the FIRST time the postgres container starts with an empty volume.
-- To re-run it: docker compose down -v, then start again.

CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,
    username   TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE posts (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id),
    body       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX posts_user_created_idx ON posts (user_id, created_at DESC);

INSERT INTO users (username) VALUES ('alice'), ('bob'), ('carol');

INSERT INTO posts (user_id, body) VALUES
    (1, 'Hello, SDLDA!'),
    (2, 'Horizontal scaling is fun'),
    (1, 'Caching comes next week'),
    (3, 'Who invalidates the cache?');
