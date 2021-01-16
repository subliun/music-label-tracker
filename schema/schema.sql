CREATE TABLE label (
  id BIGSERIAL PRIMARY KEY, 
  mbid TEXT NOT NULL UNIQUE, 
  name TEXT NOT NULL
);

CREATE TABLE release (
  id BIGSERIAL PRIMARY KEY, 
  mbid TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  artist TEXT NOT NULL,
  release_date TIMESTAMP,
  release_group_mbid TEXT NOT NULL
);

-- used to associate releases with labels
CREATE TABLE release_label (
  id BIGSERIAL PRIMARY KEY,
  release_mbid TEXT REFERENCES release(mbid) ON DELETE CASCADE,
  label_mbid TEXT REFERENCES label(mbid),
  CONSTRAINT no_duplicates UNIQUE (release_mbid, label_mbid)
);

-- used to keep track of whether a search request returned any results
CREATE TABLE mb_search_result_count (
  id BIGSERIAL PRIMARY KEY,
  last_updated TIMESTAMP NOT NULL,
  search_text TEXT NOT NULL,
  result_count INT NOT NULL, -- number of results
  mb_entity_type TEXT NOT NULL,
  CONSTRAINT unique_for_type UNIQUE(search_text, mb_entity_type)
);

CREATE TABLE mb_search_result (
  id BIGSERIAL PRIMARY KEY, 
  result_group_id BIGINT NOT NULL REFERENCES mb_search_result_count(id) ON DELETE CASCADE,
  mbid TEXT NOT NULL
);
