--
-- PostgreSQL database dump
--

-- Dumped from database version 17rc1
-- Dumped by pg_dump version 17rc1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: leaderboard; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leaderboard (
    user_id integer NOT NULL,
    correct integer NOT NULL,
    answered integer NOT NULL,
    test_length integer NOT NULL,
    adjusted real NOT NULL,
    "time" real NOT NULL,
    mode character varying(5) NOT NULL
);


ALTER TABLE public.leaderboard OWNER TO postgres;

--
-- Name: user_auth; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_auth (
    user_id integer NOT NULL,
    password_hash text NOT NULL,
    salt character(20) NOT NULL,
    username character varying(20) NOT NULL,
    disabled boolean
);


ALTER TABLE public.user_auth OWNER TO postgres;

--
-- Name: user_auth_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_auth_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_auth_user_id_seq OWNER TO postgres;

--
-- Name: user_auth_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_auth_user_id_seq OWNED BY public.user_auth.user_id;


--
-- Name: user_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_data (
    user_id integer NOT NULL,
    tests_taken integer DEFAULT 0 NOT NULL,
    questions_answered integer DEFAULT 0 NOT NULL,
    questions_correct integer DEFAULT 0 NOT NULL,
    wins integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.user_data OWNER TO postgres;

--
-- Name: user_auth user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_auth ALTER COLUMN user_id SET DEFAULT nextval('public.user_auth_user_id_seq'::regclass);


--
-- Name: user_auth_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_auth_user_id_seq', 1, true);


--
-- Name: user_auth user_auth_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_auth
    ADD CONSTRAINT user_auth_pkey PRIMARY KEY (user_id);


--
-- Name: user_auth user_auth_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_auth
    ADD CONSTRAINT user_auth_username_key UNIQUE (username);


--
-- Name: user_data user_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_data
    ADD CONSTRAINT user_data_pkey PRIMARY KEY (user_id);


--
-- Name: user_data user_data_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_data
    ADD CONSTRAINT user_data_user_id_key UNIQUE (user_id);


--
-- Name: leaderboard leaderboard_ns_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaderboard
    ADD CONSTRAINT leaderboard_ns_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_auth(user_id);


--
-- Name: user_data user_data_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_data
    ADD CONSTRAINT user_data_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_auth(user_id);


--
-- PostgreSQL database dump complete
--

