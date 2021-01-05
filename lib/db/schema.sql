CREATE TABLE label (
  id INT PRIMARY KEY, 
  last_updated TIMESTAMP NOT NULL, 
  mbid TEXT NOT NULL UNIQUE, 
  name TEXT NOT NULL);

-- used to keep track of whether a search request returned any results
CREATE TABLE mb_label_search_result_count (
  id INT PRIMARY KEY,
  last_updated, TIMESTAMP NOT NULL,
  search_text TEXT NOT NULL UNIQUE,
  result_count INT NOT NULL, -- number of results
)

CREATE TABLE mb_label_search_result (
  id INT PRIMARY KEY, 
  search_text TEXT NOT NULL REFERENCES mb_label_search_result_count(search_text),
  result_mbid TEXT NOT NULL,
);

