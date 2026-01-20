--
-- PostgreSQL database dump
--

\restrict jE2Tq9YcfXdyVhYsN3JRivChOBtDY4Xxq5kHX96HA737dyvb12wmAmwKMgc9rFX

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.7

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: prisma_migration
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO prisma_migration;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: prisma_migration
--

COMMENT ON SCHEMA public IS '';


--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: SystemLog; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."SystemLog" (
    id text NOT NULL,
    action text NOT NULL,
    details text,
    "adminId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SystemLog" OWNER TO prisma_migration;

--
-- Name: User; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    image text,
    role text DEFAULT 'ADMIN'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "avatarImageUrl" text,
    "firstName" text,
    "lastName" text,
    otp text,
    "otpExpiresAt" timestamp(3) without time zone,
    "phoneVerified" boolean DEFAULT false,
    username text,
    phone text,
    "displayUsername" text
);


ALTER TABLE public."User" OWNER TO prisma_migration;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO prisma_migration;

--
-- Name: account; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.account (
    id text NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp(3) without time zone,
    "refreshTokenExpiresAt" timestamp(3) without time zone,
    scope text,
    password text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.account OWNER TO prisma_migration;

--
-- Name: landing_page_category_cards; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.landing_page_category_cards (
    id text NOT NULL,
    color text NOT NULL,
    "darkColor" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "categoryId" text NOT NULL,
    image text
);


ALTER TABLE public.landing_page_category_cards OWNER TO prisma_migration;

--
-- Name: landing_page_category_swipers; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.landing_page_category_swipers (
    id text NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.landing_page_category_swipers OWNER TO prisma_migration;

--
-- Name: landing_page_product_grids; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.landing_page_product_grids (
    id text NOT NULL,
    title text NOT NULL,
    "topDealAbout" text NOT NULL,
    "productIds" text[],
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.landing_page_product_grids OWNER TO prisma_migration;

--
-- Name: session; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.session (
    id text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL
);


ALTER TABLE public.session OWNER TO prisma_migration;

--
-- Name: verification; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.verification (
    id text NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone
);


ALTER TABLE public.verification OWNER TO prisma_migration;

--
-- Data for Name: SystemLog; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."SystemLog" (id, action, details, "adminId", "createdAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."User" (id, name, email, "emailVerified", image, role, "createdAt", "updatedAt", "avatarImageUrl", "firstName", "lastName", otp, "otpExpiresAt", "phoneVerified", username, phone, "displayUsername") FROM stdin;
6bkxOyMHFV6bEV7nYqofxCxaTAdOGJHp	Sachin	mailitttome@gmail.com	t	https://lh3.googleusercontent.com/a/ACg8ocIVwGg6og2BFIr09WUDhcdThS-JSjKLUUfliLCF6jXsIgwOMw=s96-c	ADMIN	2025-12-25 15:30:10.39	2025-12-25 16:10:07.075	\N	Sachin	\N	\N	\N	t	mailitttome_19124	9807022011	\N
UO4poqhuIPqH5W66PPmqbnKtnveJIf3E	sachin sharma	thereisamailforme@gmail.com	t	\N	ADMIN	2025-12-25 16:40:30.314	2025-12-25 16:41:41.089	\N	sachin	sharma	\N	\N	t	thereisamailforme_eq2y4	9702634469	thereisamailforme_eq2y4
gs8ms55KaycU6D4gSSU0tbqTSLCFDsjR	Sachin	mistakelytest10@gmail.com	t	https://lh3.googleusercontent.com/a/ACg8ocL44ipbKy12a1QcV6rADv9Z4jFADBl1Gom69dcP2hKMGu-2dQ=s96-c	ADMIN	2025-12-27 06:36:21.161	2025-12-27 06:36:56.583	\N	Sachin	\N	\N	\N	t	mistakelytest10_83474	9801993834	\N
0Ixv3A2Fb84LxsW8InaiC8iiJXiLa0Wm	Admus Sami	samiadmus@gmail.com	t	https://lh3.googleusercontent.com/a/ACg8ocJHVYKqLMvptgol_OetD3odlFWJgVQY-txPg1RWGoYQ767lvw=s96-c	ADMIN	2025-12-28 03:28:42.218	2025-12-28 03:29:14.404	\N	Admus	Sami	\N	\N	t	samiadmus_02595	9817370485	\N
OJKU7jJ2uWzhQOwrQQaPAW1o2KY1EAc9	Sachin	mistakelytest12@gmail.com	t	https://lh3.googleusercontent.com/a/ACg8ocJwxPVpwUTVS8ppWr6EZMPjGgCjKuyIP98vGjDyD9ZHfrsDgg=s96-c	ADMIN	2026-01-16 17:33:19.917	2026-01-16 17:33:27.088	\N	Sachin	\N	332271	2026-01-16 17:35:27.085	f	mistakelytest12_96946	9779804065000	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
40eedf98-295f-40a5-92ce-e6805e814636	b353afa7e52caeae5ceaa13478d9f4f10561879e0e361f409b81ffe92fa03556	2025-12-25 14:32:31.464889+00	20251225143229_init_better_auth	\N	\N	2025-12-25 14:32:30.376747+00	1
090e52c3-d2e2-4620-a1cb-69549f6381a2	b392f512021bdd1f4210a4acc8215c3a48cb0a250387186651084ede2749cfc8	2025-12-25 15:29:04.373748+00	20251225152903_add_auth_fields	\N	\N	2025-12-25 15:29:03.792278+00	1
b7bb08c6-c961-4d1d-b596-2ff631f6d099	b66ec46c3eb317dcd131c9f62b22245c248b79a01d00f69cfee608ab9f27e6c9	2025-12-25 16:06:33.763947+00	20251225160632_add_phone_to_user	\N	\N	2025-12-25 16:06:33.163757+00	1
81b6e90f-183f-4a2f-be73-650c6629fac1	375548429220ecfd1a725c109b1a15cb47ec4e0a91da1f7955b2a88b2dc5b817	2025-12-25 16:30:32.902292+00	20251225163029_add_display_username	\N	\N	2025-12-25 16:30:31.342348+00	1
a2632de1-bcc2-4960-be68-9e11b8eb829b	f96f26772fbf256a04b81b347c7c1b0ecf637e0df77b78dc1ad7f2a6ad732ae2	2025-12-27 06:38:24.329456+00	20251227063823_add_landing_page_models	\N	\N	2025-12-27 06:38:23.796037+00	1
\.


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.account (id, "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, password, "createdAt", "updatedAt") FROM stdin;
XKkDCtlteDG6aprnkn1iicfT6Y7olXvU	UO4poqhuIPqH5W66PPmqbnKtnveJIf3E	credential	UO4poqhuIPqH5W66PPmqbnKtnveJIf3E	\N	\N	\N	\N	\N	\N	d563ef558bdc743e8c2dadfa44153c5e:aad8a67ca4bd3c488a4df3329eb47a8c627810e6052797c227c2f4fd40e26e1d09bb7f265515c621f5b11e5df69bcbeaefceb49d9357402f18caff4c7a19345f	2025-12-25 16:40:30.486	2025-12-25 16:40:30.486
3ewT5s8MIgawVGKMnphFFyniPVRBdqiJ	104198950327951983474	google	gs8ms55KaycU6D4gSSU0tbqTSLCFDsjR	ya29.A0Aa7pCA-yZgvKqhC4pXowYikufkaDk_mPU5QlaVKoGOrb7Dd9t-x4Ls428uP_r5pkEz4WPGH0IVz526p6D9TQ8yFZt6rXumFTezXvGBEed3GhJqOeYu-uiGrB5oJK7Jo6ghtXJu-pu-4NvL5mh9A9oHdtis37OHF35SNnpXeLG6KEkyICvJhr1g0p3lblR1DM9rrQ_3BgV3Gv5IQbmlaXr8fBY69rE4foNBk_1mwvQcCEaZ3HAopBzEnRemIamp7F2JQlKl5A6ScO6Y0dwo0IR8OOzSDhaCgYKAaoSARQSFQHGX2Mi5lnBFEG6yFXoyskdjAmXnA0291	\N	eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ5NmQwMDhlOGM3YmUxY2FlNDIwOWUwZDVjMjFiMDUwYTYxZTk2MGYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIyOTA3MTQxMDM3NDItaWJoaWVqYnFwMzNmazRjZzZrbDA5OTdybmxrZXJzbWwuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIyOTA3MTQxMDM3NDItaWJoaWVqYnFwMzNmazRjZzZrbDA5OTdybmxrZXJzbWwuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDQxOTg5NTAzMjc5NTE5ODM0NzQiLCJlbWFpbCI6Im1pc3Rha2VseXRlc3QxMEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IlBTLXRLaGZYQWxlTVhqOGY1ZHE5b1EiLCJuYW1lIjoiU2FjaGluIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0w0NGlwYkt5MTJhMVFjVjZyQUR2OVo0akZBREJsMUdvbTY5ZGNQMmhLTUd1LTJkUT1zOTYtYyIsImdpdmVuX25hbWUiOiJTYWNoaW4iLCJpYXQiOjE3NjY4MTc0NDUsImV4cCI6MTc2NjgyMTA0NX0.OvmTdkH1y4kzNxxIEd0CJ4WjrCH3D2zv_GV78HR52mRqpbWRtJ97X4UjrneWFSUEql8Y_CO4OSZsyjwWG8rAl3NP6PNOkXQz0Rf9Vzte_1e52X7jfZeYP9DwKNSfsNjZ8neuT8XlEIBos4mJiMciW7Yk2dACZuAnuGYUriWGdZcpLRyFR9OovD736vI8CAL-2_4dzvw94K5YCVerebzg_I8goWvDriL-_qHl6IRpSuX2uObWt0TAyNZcPSMo6IYl3UUXuildvUWdxg3JTV5U3ZE0-mUUngjlE_RC52RjEckzJlJVwWsztkI4a6XDXzOd3_sx21qv5B82nzLnLNqKbQ	2025-12-27 07:37:21.092	\N	https://www.googleapis.com/auth/userinfo.profile,openid,https://www.googleapis.com/auth/userinfo.email	\N	2025-12-27 06:36:21.476	2025-12-27 06:37:25.7
3Xg0mgQQ6MOvCHfGbwLk2ufHJazQZEh7	111690995483590557702	google	UO4poqhuIPqH5W66PPmqbnKtnveJIf3E	ya29.A0Aa7pCA8bcuB1WrqdqPa08pja038froWB1IOIpZMrB15usRskX_ICHR6EGWl4tmYuhnkTVyjlQgrmn9p2zKBhwtqmkkfYzCoTNwOIKXkxx_iVKTqc0C4SZTotZjJUkwLgjKxhrJhuDHHLdrY3wfewqsGqPodDXSiMA4vLHtcH1Ih3g4tiVUHfyltDysBL7RaYnox7FMtW_JFZjJFevB-D0yKs3y5AA-tJ87EYvhCmHGvq97ftHNgC4CwJQRnDGD1-0jOXtNM1m-TMzwdWHwFlaVQ2KbYY0waCgYKAcoSARUSFQHGX2MiqxIX7fyMjayajZyZCi08MQ0293	\N	eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ5NmQwMDhlOGM3YmUxY2FlNDIwOWUwZDVjMjFiMDUwYTYxZTk2MGYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIyOTA3MTQxMDM3NDItaWJoaWVqYnFwMzNmazRjZzZrbDA5OTdybmxrZXJzbWwuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIyOTA3MTQxMDM3NDItaWJoaWVqYnFwMzNmazRjZzZrbDA5OTdybmxrZXJzbWwuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTE2OTA5OTU0ODM1OTA1NTc3MDIiLCJlbWFpbCI6InRoZXJlaXNhbWFpbGZvcm1lQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiV1J5Yk9WNjdZaEdpM1lVc2NNbVN2QSIsIm5hbWUiOiJTYWNoaW4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSTNULVRZVERTelJpVkplZVoydnNxM0hFd0hoY2VnbDhSQkVYZ3dySGNsUElkSDVnPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IlNhY2hpbiIsImlhdCI6MTc2Njg2MTQzNCwiZXhwIjoxNzY2ODY1MDM0fQ.e2UzE87oQ50sPoCc0d46SW-3vrkw3Kn03q1PLCiahbxAlzzMKezN3gdhcY28EXZOQNdtlJreCTbkgr5sqEY8601gABqCCr9wI1KpcghjSfWoACnxkrDeoP7DT2bGLS2qnV4ISy6HlN1JmzY8VGQRrtgMb9gHkY5WF0YvKE_mE0DSkXUvpgNpVAGYnMpd0FMT1KTna-il_zRfqcufwFxU5Fu8YUNPHIbnh0KByPantuIDU_i3xDXOm7cJExlxCkG3RTH60tsQQtepFXuKSynYYinB1AOllQVV1f-K0nNZ4khLjnhLIdXJIDeZEst9W66a8_HTgItRTYh5DNHgHbFxbw	2025-12-27 19:50:32.935	\N	https://www.googleapis.com/auth/user.birthday.read,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/user.gender.read,openid,https://www.googleapis.com/auth/user.phonenumbers.read,https://www.googleapis.com/auth/userinfo.profile	\N	2025-12-27 10:18:28.856	2025-12-27 18:50:36.174
GUvcAbkAVCpyRnlpGDT2Re8tl7uzbH0B	105562713864040302595	google	0Ixv3A2Fb84LxsW8InaiC8iiJXiLa0Wm	ya29.A0Aa7pCA9dfrWAeQMPp4C1S01xdit1ZjAywIbs4laRxew_jX4fDnbPe1_UyeqzdUiBNvnaw_Izj9uR6m7Gc1WZSQmKlnirTzKrviQEflg7Bt2pPynJIGb-de8FNQUiJyIgOnxL4U1JME_qbzAv7jeeLlA30k0JmNqK8-P3AvrfrkQvk7M9aB305QPELax2AoNW-LknLddL_1XMBfLM7bOIUWeVwCZD8ETf1ZaeyfyoIcM7JLdko12cLf5sAlwX1UQX3SWDUC5CTQTzriRO1tBNoE8jsF8MXQaCgYKAWISARESFQHGX2MiXVMIVYJr8Q1v3pZR9rJx8w0293	\N	eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ5NmQwMDhlOGM3YmUxY2FlNDIwOWUwZDVjMjFiMDUwYTYxZTk2MGYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIyOTA3MTQxMDM3NDItaWJoaWVqYnFwMzNmazRjZzZrbDA5OTdybmxrZXJzbWwuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIyOTA3MTQxMDM3NDItaWJoaWVqYnFwMzNmazRjZzZrbDA5OTdybmxrZXJzbWwuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDU1NjI3MTM4NjQwNDAzMDI1OTUiLCJlbWFpbCI6InNhbWlhZG11c0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IlpjazlIUjBsRDlVa3dCTDlKdGkzeGciLCJuYW1lIjoiQWRtdXMgU2FtaSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKSFZZS3FMTXZwdGdvbF9PZXREM29kbEZXSmdWUVktdHhQZzFSV0dvWVE3Njdsdnc9czk2LWMiLCJnaXZlbl9uYW1lIjoiQWRtdXMiLCJmYW1pbHlfbmFtZSI6IlNhbWkiLCJpYXQiOjE3NjY4OTI1MjEsImV4cCI6MTc2Njg5NjEyMX0.MjPo7Qjx-aEi-WAw284eLpNrPfUo6YbhzLXG_itnSksOJMRgBAajq5Fkx0y5XXBAbJYQz9ZXyTBjScL3YYUq8ufdfnUqch7ESdLjPrcqJjQkISWlenNWI-0-GDq71b5Npt5QJfBsKCUbAswv902XjYEx82fLYGYji3DNDdwfV05NxcIHRDI9YtSbaPIZLApAaqYtTksgKz4P0YRBpZY1E-__5HWKF_ADDHML8lBt_w9za_hnOD9PWD_G7h26JLdgd0VcKtOxJdcFxETsEwZHp2gP__HeW8IaeplHWRw0uaKCTfMF79aSEf9iowNGtf63NOmvZhfCiXM6AoMc1nUxBw	2025-12-28 04:28:37.626	\N	https://www.googleapis.com/auth/userinfo.profile,openid,https://www.googleapis.com/auth/userinfo.email	\N	2025-12-28 03:28:42.511	2025-12-28 03:28:42.512
SabyTpRNsA2oWi6eFBnCMgOaKvINzxdp	112726113845494519124	google	6bkxOyMHFV6bEV7nYqofxCxaTAdOGJHp	ya29.A0AUMWg_KSO9DCG-laAN5op4FDi1PtGIAEZsMyncNB3APYlIy7xNbO76b9HxQBtvlb-GS194u15ivUi_A9JBsfqw9UN8O_Pi1q8nSZV-v2Q--VdCi-A2_O9zs6KJtwu0VNHOGBdJz3esrywhyFSE9BOVnqAodq61IAuyhc0Y-Jz2PT_W-VX_7Ap-zDNQLMk77DfuXwYGbVzpVJglgGQb7pEm9ZkbLQcHiNj9H3iYym43nKDoiptLgPjbbxWTzmRzPywdI-vfTxzPNOaYSRnxlC1f0dhtXqGAaCgYKAVcSAQ8SFQHGX2MiVamyHBmv6VdfDDEvKxy_Tw0293	\N	eyJhbGciOiJSUzI1NiIsImtpZCI6IjdiZjU5NTQ4OWEwYmIxNThiMDg1ZTIzZTdiNTJiZjk4OTFlMDQ1MzgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIyOTA3MTQxMDM3NDItaWJoaWVqYnFwMzNmazRjZzZrbDA5OTdybmxrZXJzbWwuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIyOTA3MTQxMDM3NDItaWJoaWVqYnFwMzNmazRjZzZrbDA5OTdybmxrZXJzbWwuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTI3MjYxMTM4NDU0OTQ1MTkxMjQiLCJlbWFpbCI6Im1haWxpdHR0b21lQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoidHdBOG45aDdPX0RESmZlel9iblI2dyIsIm5hbWUiOiJTYWNoaW4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSVZ3R2c2b2cyQkZJcjA5V1VEaGNkVGhTLUpTaktMVVVmbGlMQ0Y2alhzSWd3T013PXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IlNhY2hpbiIsImlhdCI6MTc2ODU4NDMxOCwiZXhwIjoxNzY4NTg3OTE4fQ.qA1Cfzz8OaADLrabdcCyUVXUtG9NM2bm9TOi3eoOuK6MkGdRarzJQU1mUHaRavgsEG_0-dadsc2wY9kHh7Y_wC6T9ikJVi54HNap_lp5nylcZYy2qzgot90ePbVM2nia-b5Smkanv_E4Z-0Mdkqaa3mmfEvqkwbiTm_CLjWc1yCElyzd1-Mrzr5bq_1hlJkvHs3gWZBLn3wJPU2kLkAwlxk6dzjwl_bjKhG8jUwhdb6HbFp4wdn7T7xHgJXWJcvLKl3GaNbNoBvpZVvlCP4itX3uQNAoArVhuczUJNHxe69bdDpp9dqP7NcBQZDk3nIfexOfq8WpHUzLAMogm0iuvQ	2026-01-16 18:25:18.394	\N	https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/userinfo.profile,openid	\N	2025-12-25 15:30:10.715	2026-01-16 17:25:20.644
XGN8YhxUN2akmmUQhdzflZ4vmldahnEB	117288238242156396946	google	OJKU7jJ2uWzhQOwrQQaPAW1o2KY1EAc9	ya29.A0AUMWg_LLph4l0OQb6An-Yy1MDtiFsDaTwGcQWeea4NNRnPfvV_aCtKTRbG-Dz1Qp9d1hEqyipFVVCMTx4puryZGMYaGrwykmqFtf0HQK5i8Fgk5XWPg5neVIkgaOCbkqdgKlnqah8emU1xhbgSBG20e6iR81Q1aDD6NEPGSULnxdcs94bfeE6djGxPnj9pRYIOxIfMmPP3WgNb_vrh-tBhQVfDB3fZtd6cR2Kl5H6dmYG2ie4kOp2Qqkd5ufdtBe0bZhIS7srcSBW3jqgruT_50SGyuDLwaCgYKAW8SARcSFQHGX2Mi1V2prDnMwDh-Fpo0Q5pqUA0293	\N	eyJhbGciOiJSUzI1NiIsImtpZCI6IjdiZjU5NTQ4OWEwYmIxNThiMDg1ZTIzZTdiNTJiZjk4OTFlMDQ1MzgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIyOTA3MTQxMDM3NDItaWJoaWVqYnFwMzNmazRjZzZrbDA5OTdybmxrZXJzbWwuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIyOTA3MTQxMDM3NDItaWJoaWVqYnFwMzNmazRjZzZrbDA5OTdybmxrZXJzbWwuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTcyODgyMzgyNDIxNTYzOTY5NDYiLCJlbWFpbCI6Im1pc3Rha2VseXRlc3QxMkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IlRvamhTcnJGQllPNXpxVXh1dXZvVkEiLCJuYW1lIjoiU2FjaGluIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0p3eFBWcHdVVFZTOHBwV3I2RVpNUGpHZ0NqS3V5SVA5OHZHakR5RDlaSGZyc0RnZz1zOTYtYyIsImdpdmVuX25hbWUiOiJTYWNoaW4iLCJpYXQiOjE3Njg1ODQ3OTcsImV4cCI6MTc2ODU4ODM5N30.pW1yUMVmzVwijMvRefUvJV2MJmR0mEVwzvur8dlB_oXmIjqiPzzyCVI-YYF6imeTrDfVJgbTI61_O9_PTfVTLP7vt37TgrZJW-jrkkwzgvd27dOo8XTHRkXhaP3JxxV6CXkEKvYFclGJllDsUzZaXjNWwAKMj1cukueUnV37o-zjnQCABNamzhByPCxSHWkoERRvpAVkrwSc0LKK1HewUQsoEU7mNXfI4dDjHFPCPyin3CNCin82IebUY0ZJOJukymRwzElji7_XkSh8FgkoOJBv_cyCYM87Bi1h5vK5i8Iql-vCKF419uTzjV_l9RdzxHQpdRk9STjrVxNgsiPfUg	2026-01-16 18:33:17.511	\N	openid,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/userinfo.profile	\N	2026-01-16 17:33:20.122	2026-01-16 17:33:20.122
\.


--
-- Data for Name: landing_page_category_cards; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.landing_page_category_cards (id, color, "darkColor", "sortOrder", "isActive", "createdAt", "updatedAt", "categoryId", image) FROM stdin;
cmjnzx71l00006cia3vhk0gd4	from-blue-500 to-purple-500	\N	0	t	2025-12-27 07:45:31.785	2025-12-27 07:45:31.785	cmjig7gpk0000ddeet6ya3rfu	https://res.cloudinary.com/dzvq7ccgr/image/upload/v1766821530/yolmsi10oealsnjnjrah.svg
\.


--
-- Data for Name: landing_page_category_swipers; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.landing_page_category_swipers (id, title, category, "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: landing_page_product_grids; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.landing_page_product_grids (id, title, "topDealAbout", "productIds", "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.session (id, "expiresAt", token, "createdAt", "updatedAt", "ipAddress", "userAgent", "userId") FROM stdin;
ZuNrPl2OTM2WseKqRN0u4KJdqHNnjYzh	2026-01-02 07:29:39.092	WqfOvZO2tqTOnDKHpOPpSZLsuAPKChld	2025-12-26 07:29:39.092	2025-12-26 07:29:39.092	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	UO4poqhuIPqH5W66PPmqbnKtnveJIf3E
7gfIOWSoTBfE7G77ePx11HJ0JeGgJRIE	2026-01-02 09:29:52.973	lK7qVnCi6sbif4r4WDXgBVMOEmt5rPoD	2025-12-26 09:29:52.973	2025-12-26 09:29:52.973	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	UO4poqhuIPqH5W66PPmqbnKtnveJIf3E
ArU7W2ivE3Y8BrfnxFWtQX5EGeyNqnHJ	2026-01-02 18:22:04.509	SC5rbs6nNMWWP7mbTKSU2M5fRpfE7D0L	2025-12-25 16:49:45.211	2025-12-26 18:22:04.509	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	UO4poqhuIPqH5W66PPmqbnKtnveJIf3E
icCAFchOY1iD7TMca4spoBDq1FkwYFxa	2026-01-03 06:35:38.377	BeSatvMrgLoqKD4PSD2yHzLAWIRHyvC9	2025-12-27 06:35:38.377	2025-12-27 06:35:38.377	27.34.68.205	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	6bkxOyMHFV6bEV7nYqofxCxaTAdOGJHp
HMPI0YMGiWc43rRe9l9BIB7Aoi7Y3UCi	2026-01-03 06:35:53.969	mLh10ISCUEuJGaH0dKPILZhxIupqiguI	2025-12-27 06:35:53.969	2025-12-27 06:35:53.969	27.34.68.205	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	6bkxOyMHFV6bEV7nYqofxCxaTAdOGJHp
cGGc5jbary5Q3k1K9VL6VQFFon62Xznh	2026-01-03 06:36:21.785	U1hrumK1lbtUu421VjSpub158rwmYljV	2025-12-27 06:36:21.785	2025-12-27 06:36:21.785	27.34.68.205	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	gs8ms55KaycU6D4gSSU0tbqTSLCFDsjR
x8VHMORSjCbuOVhnrvkWeXnNj1k2qC8u	2026-01-03 06:37:26.008	SHAqoVSyYBD2EtyZ39eF8o54khJoVSKX	2025-12-27 06:37:26.009	2025-12-27 06:37:26.009	27.34.68.205	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	gs8ms55KaycU6D4gSSU0tbqTSLCFDsjR
nAGx3QwpO2UimRomlb4ePppxagz17j7T	2026-01-03 10:18:29.14	DWg4s5L7MUGXwl9Vwce8GG1OJ2H4THfx	2025-12-27 10:18:29.14	2025-12-27 10:18:29.14	27.34.68.205	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	UO4poqhuIPqH5W66PPmqbnKtnveJIf3E
KsjjePoIE8Cx5EUGvqYQQVTsBOAsikU2	2026-01-03 10:21:30.416	7oc6mtNWDMpCXLD8ZkaUNz9X1V5lRHBd	2025-12-27 10:21:30.417	2025-12-27 10:21:30.417	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	6bkxOyMHFV6bEV7nYqofxCxaTAdOGJHp
NwDEMU0uNp98CpTSnNqFLzKzDNeJI3kY	2026-01-03 11:47:30.248	KO5V24ZWErYPnKzmeIKgyKXl5EaIc7Gr	2025-12-27 11:47:30.248	2025-12-27 11:47:30.248	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	6bkxOyMHFV6bEV7nYqofxCxaTAdOGJHp
4FjLQPyrF3XKZGnBA3WmAUjYG8QqRTZm	2026-01-03 18:02:04.02	p7wd3sHsUiR0faIbEV3eLjAmT3TfJMAd	2025-12-27 18:02:04.02	2025-12-27 18:02:04.02	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	UO4poqhuIPqH5W66PPmqbnKtnveJIf3E
pucQD0w8wKvaOisWQh0g4F8wnK3YMXxc	2026-01-03 18:50:36.296	OedYDircooTk5D6PoBkqHVVjmqwisCxx	2025-12-27 18:50:36.296	2025-12-27 18:50:36.296	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	UO4poqhuIPqH5W66PPmqbnKtnveJIf3E
uEpAaeL5CBaTUvhHVhDfk5EjfDjp9B3a	2026-01-05 10:02:57.305	I63YA1iiSUESe1omITQANmSaTEO5W0U5	2025-12-27 12:01:23.043	2025-12-29 10:02:57.305	27.34.68.205	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	UO4poqhuIPqH5W66PPmqbnKtnveJIf3E
qSxCAGGr7p2VOjBg776JUxc9IV6YVmvW	2026-01-05 11:15:59.375	skdH99wJ7QciZsErxKLBBZURJqQHkcEQ	2025-12-28 03:28:42.806	2025-12-29 11:15:59.375	27.34.68.205	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0	0Ixv3A2Fb84LxsW8InaiC8iiJXiLa0Wm
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: SystemLog SystemLog_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."SystemLog"
    ADD CONSTRAINT "SystemLog_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: landing_page_category_cards landing_page_category_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.landing_page_category_cards
    ADD CONSTRAINT landing_page_category_cards_pkey PRIMARY KEY (id);


--
-- Name: landing_page_category_swipers landing_page_category_swipers_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.landing_page_category_swipers
    ADD CONSTRAINT landing_page_category_swipers_pkey PRIMARY KEY (id);


--
-- Name: landing_page_product_grids landing_page_product_grids_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.landing_page_product_grids
    ADD CONSTRAINT landing_page_product_grids_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_phone_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "User_phone_key" ON public."User" USING btree (phone);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: account_providerId_accountId_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "account_providerId_accountId_key" ON public.account USING btree ("providerId", "accountId");


--
-- Name: session_token_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX session_token_key ON public.session USING btree (token);


--
-- Name: SystemLog SystemLog_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."SystemLog"
    ADD CONSTRAINT "SystemLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: prisma_migration
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict jE2Tq9YcfXdyVhYsN3JRivChOBtDY4Xxq5kHX96HA737dyvb12wmAmwKMgc9rFX

