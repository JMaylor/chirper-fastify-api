CREATE TABLE user_account (
	user_id INT GENERATED ALWAYS AS IDENTITY,
	email TEXT NOT NULL UNIQUE,
	bio VARCHAR(140) DEFAULT '',
	sub TEXT NOT NULL UNIQUE,
	user_name VARCHAR(20) NOT NULL,
	handle VARCHAR(20) NOT NULL UNIQUE,
	picture TEXT NOT NULL,
	PRIMARY KEY(user_id)
);

CREATE TABLE follow (
	follow_id INT GENERATED ALWAYS AS IDENTITY,
	followed_user_email TEXT NOT NULL,
	following_user_email TEXT NOT NULL,
	is_active BOOLEAN DEFAULT True,
	CONSTRAINT fk_followed_user_email
		FOREIGN KEY(followed_user_email) 
		REFERENCES user_account(email)
		ON DELETE CASCADE,
	CONSTRAINT fk_following_user_email
		FOREIGN KEY(following_user_email) 
		REFERENCES user_account(email)
		ON DELETE CASCADE,
	UNIQUE (followed_user_email, following_user_email)
);

CREATE TABLE hashtag (
	tag TEXT NOT NULL,
	PRIMARY KEY(tag)
);

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE chirp (
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	chirp_id INT GENERATED ALWAYS AS IDENTITY,
	author_email TEXT NOT NULL,
	body varchar(140) NOT NULL,
	hashtags TEXT[],
	PRIMARY KEY(chirp_id),
	CONSTRAINT fk_author
		FOREIGN KEY(author_email) 
		REFERENCES user_account(email)
		ON DELETE CASCADE
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON chirp
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE chirpstat (
	chirpstat_id INT GENERATED ALWAYS AS IDENTITY,
	user_email TEXT NOT NULL,
	chirp INT NOT NULL,
	liked BOOLEAN DEFAULT False,
	rechirped BOOLEAN DEFAULT False,
	PRIMARY KEY(chirpstat_id),
	CONSTRAINT fk_user
		FOREIGN KEY(user_email) 
		REFERENCES user_account(email)
		ON DELETE CASCADE,
	CONSTRAINT fk_chirp
		FOREIGN KEY(chirp) 
		REFERENCES chirp(chirp_id)
		ON DELETE CASCADE,
	UNIQUE (user_email, chirp)
);

CREATE OR REPLACE FUNCTION chirp_details(email text)
	RETURNS TABLE (chirp_id int, body text, created_at TIMESTAMPTZ, hashtags text[], user_name text, handle text, picture text, liked BOOLEAN, rechirped BOOLEAN, likes int, rechirps int)
AS
$body$
	SELECT chirp_id,
	body,
	created_at,
	hashtags,
	user_name,
	handle,
	picture,
	liked,
	rechirped,
(SELECT COUNT(nullif(chirpstat.liked, false)) FROM chirpstat WHERE chirpstat.chirp = chirp.chirp_id) AS likes,
(SELECT COUNT(nullif(chirpstat.rechirped, false)) FROM chirpstat WHERE chirpstat.chirp = chirp.chirp_id) AS rechirps
FROM chirp JOIN user_account ON chirp.author_email = user_account.email 
		LEFT JOIN chirpstat u ON u.user_email = $1 AND u.chirp = chirp.chirp_id;
$body$
language sql;

CREATE OR REPLACE FUNCTION liked_chirps(email text)
	RETURNS TABLE (chirp_id int, body text, created_at TIMESTAMPTZ, hashtags text[], user_name text, handle text, picture text, liked BOOLEAN, rechirped BOOLEAN, likes int, rechirps int)
AS
$body$
	SELECT chirp_id,
	body,
	created_at,
	hashtags,
	user_name,
	handle,
	picture,
	liked,
	rechirped,
(SELECT COUNT(nullif(chirpstat.liked, false)) FROM chirpstat WHERE chirpstat.chirp = chirp.chirp_id) AS likes,
(SELECT COUNT(nullif(chirpstat.rechirped, false)) FROM chirpstat WHERE chirpstat.chirp = chirp.chirp_id) AS rechirps
FROM chirp JOIN user_account ON chirp.author_email = user_account.email 
		LEFT JOIN chirpstat u ON u.user_email = $1 AND u.chirp = chirp.chirp_id WHERE liked = True;
$body$
language sql;

CREATE OR REPLACE FUNCTION hashtag_chirps(email text, hashtag text)
	RETURNS TABLE (chirp_id int, body text, created_at TIMESTAMPTZ, hashtags text[], user_name text, handle text, picture text, liked BOOLEAN, rechirped BOOLEAN, likes int, rechirps int)
AS
$body$
	SELECT chirp_id,
	body,
	created_at,
	hashtags,
	user_name,
	handle,
	picture,
	liked,
	rechirped,
(SELECT COUNT(nullif(chirpstat.liked, false)) FROM chirpstat WHERE chirpstat.chirp = chirp.chirp_id) AS likes,
(SELECT COUNT(nullif(chirpstat.rechirped, false)) FROM chirpstat WHERE chirpstat.chirp = chirp.chirp_id) AS rechirps
FROM chirp JOIN user_account ON chirp.author_email = user_account.email 
		LEFT JOIN chirpstat u ON u.user_email = $1 AND u.chirp = chirp.chirp_id WHERE $2 = ANY(hashtags);
$body$
language sql;

CREATE OR REPLACE FUNCTION user_chirps(email text, handle text)
	RETURNS TABLE (chirp_id int, body text, created_at TIMESTAMPTZ, hashtags text[], user_name text, handle text, picture text, liked BOOLEAN, rechirped BOOLEAN, likes int, rechirps int)
AS
$body$
	SELECT chirp_id,
	body,
	created_at,
	hashtags,
	user_name,
	handle,
	picture,
	liked,
	rechirped,
(SELECT COUNT(nullif(chirpstat.liked, false)) FROM chirpstat WHERE chirpstat.chirp = chirp.chirp_id) AS likes,
(SELECT COUNT(nullif(chirpstat.rechirped, false)) FROM chirpstat WHERE chirpstat.chirp = chirp.chirp_id) AS rechirps
FROM chirp JOIN user_account ON chirp.author_email = user_account.email 
		LEFT JOIN chirpstat u ON u.user_email = $1 AND u.chirp = chirp.chirp_id WHERE handle = $2;
$body$
language sql;