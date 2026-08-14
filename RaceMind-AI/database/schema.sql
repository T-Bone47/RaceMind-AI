--
-- PostgreSQL database dump
--

\restrict 43uasGQnkJfb6WIwbr3QK94xw9JH6EWdq678799bXpbjtA5gyVC2wWyDjKNb5mJ

-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


--
-- Name: driver_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.driver_profiles (
    user_id uuid NOT NULL,
    aggression_score double precision NOT NULL,
    consistency_score double precision NOT NULL,
    tyre_management_score double precision NOT NULL,
    total_sessions integer NOT NULL,
    total_laps integer NOT NULL,
    notes character varying(1000),
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fuel_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fuel_logs (
    session_id uuid NOT NULL,
    lap_id uuid,
    fuel_remaining_kg double precision NOT NULL,
    fuel_per_lap_kg double precision,
    laps_remaining_estimate double precision,
    recorded_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: laps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.laps (
    session_id uuid NOT NULL,
    lap_number integer NOT NULL,
    lap_time_ms integer,
    sector_1_ms integer,
    sector_2_ms integer,
    sector_3_ms integer,
    is_valid boolean NOT NULL,
    tyre_compound character varying(20),
    track_position integer,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    user_id uuid NOT NULL,
    game character varying(30) NOT NULL,
    track_name character varying(100) NOT NULL,
    session_type character varying(20) NOT NULL,
    weather character varying(20),
    air_temp_c double precision,
    track_temp_c double precision,
    total_laps integer,
    started_at timestamp without time zone,
    ended_at timestamp without time zone,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: strategy_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.strategy_plans (
    session_id uuid NOT NULL,
    recommended_pit_lap integer,
    recommended_compound character varying(20),
    reason character varying(500),
    is_active boolean NOT NULL,
    generated_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: telemetry_frames; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.telemetry_frames (
    session_id uuid NOT NULL,
    lap_id uuid,
    timestamp_ms integer NOT NULL,
    speed_kph double precision NOT NULL,
    throttle_pct double precision NOT NULL,
    brake_pct double precision NOT NULL,
    steering double precision NOT NULL,
    gear integer NOT NULL,
    engine_rpm double precision NOT NULL,
    drs_active boolean NOT NULL,
    id uuid NOT NULL
);


--
-- Name: tyre_stints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tyre_stints (
    session_id uuid NOT NULL,
    lap_id uuid,
    compound character varying(20) NOT NULL,
    age_laps integer NOT NULL,
    wear_fl_pct double precision NOT NULL,
    wear_fr_pct double precision NOT NULL,
    wear_rl_pct double precision NOT NULL,
    wear_rr_pct double precision NOT NULL,
    temp_fl_c double precision,
    temp_fr_c double precision,
    temp_rl_c double precision,
    temp_rr_c double precision,
    pressure_fl_psi double precision,
    pressure_fr_psi double precision,
    pressure_rl_psi double precision,
    pressure_rr_psi double precision,
    recorded_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    email character varying(255) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    display_name character varying(100) NOT NULL,
    is_active boolean NOT NULL,
    is_superuser boolean NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: driver_profiles pk_driver_profiles; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver_profiles
    ADD CONSTRAINT pk_driver_profiles PRIMARY KEY (id);


--
-- Name: fuel_logs pk_fuel_logs; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fuel_logs
    ADD CONSTRAINT pk_fuel_logs PRIMARY KEY (id);


--
-- Name: laps pk_laps; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laps
    ADD CONSTRAINT pk_laps PRIMARY KEY (id);


--
-- Name: sessions pk_sessions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT pk_sessions PRIMARY KEY (id);


--
-- Name: strategy_plans pk_strategy_plans; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.strategy_plans
    ADD CONSTRAINT pk_strategy_plans PRIMARY KEY (id);


--
-- Name: telemetry_frames pk_telemetry_frames; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telemetry_frames
    ADD CONSTRAINT pk_telemetry_frames PRIMARY KEY (id);


--
-- Name: tyre_stints pk_tyre_stints; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tyre_stints
    ADD CONSTRAINT pk_tyre_stints PRIMARY KEY (id);


--
-- Name: users pk_users; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT pk_users PRIMARY KEY (id);


--
-- Name: laps uq_laps_session_lap_number; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laps
    ADD CONSTRAINT uq_laps_session_lap_number UNIQUE (session_id, lap_number);


--
-- Name: ix_driver_profiles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_driver_profiles_user_id ON public.driver_profiles USING btree (user_id);


--
-- Name: ix_fuel_logs_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_fuel_logs_session_id ON public.fuel_logs USING btree (session_id);


--
-- Name: ix_laps_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_laps_session_id ON public.laps USING btree (session_id);


--
-- Name: ix_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_sessions_user_id ON public.sessions USING btree (user_id);


--
-- Name: ix_strategy_plans_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_strategy_plans_session_id ON public.strategy_plans USING btree (session_id);


--
-- Name: ix_telemetry_frames_session_ts; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_telemetry_frames_session_ts ON public.telemetry_frames USING btree (session_id, timestamp_ms);


--
-- Name: ix_tyre_stints_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_tyre_stints_session_id ON public.tyre_stints USING btree (session_id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: driver_profiles fk_driver_profiles_user_id_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver_profiles
    ADD CONSTRAINT fk_driver_profiles_user_id_users FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: fuel_logs fk_fuel_logs_lap_id_laps; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fuel_logs
    ADD CONSTRAINT fk_fuel_logs_lap_id_laps FOREIGN KEY (lap_id) REFERENCES public.laps(id) ON DELETE SET NULL;


--
-- Name: fuel_logs fk_fuel_logs_session_id_sessions; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fuel_logs
    ADD CONSTRAINT fk_fuel_logs_session_id_sessions FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: laps fk_laps_session_id_sessions; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laps
    ADD CONSTRAINT fk_laps_session_id_sessions FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: sessions fk_sessions_user_id_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT fk_sessions_user_id_users FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: strategy_plans fk_strategy_plans_session_id_sessions; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.strategy_plans
    ADD CONSTRAINT fk_strategy_plans_session_id_sessions FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: telemetry_frames fk_telemetry_frames_lap_id_laps; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telemetry_frames
    ADD CONSTRAINT fk_telemetry_frames_lap_id_laps FOREIGN KEY (lap_id) REFERENCES public.laps(id) ON DELETE SET NULL;


--
-- Name: telemetry_frames fk_telemetry_frames_session_id_sessions; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telemetry_frames
    ADD CONSTRAINT fk_telemetry_frames_session_id_sessions FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: tyre_stints fk_tyre_stints_lap_id_laps; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tyre_stints
    ADD CONSTRAINT fk_tyre_stints_lap_id_laps FOREIGN KEY (lap_id) REFERENCES public.laps(id) ON DELETE SET NULL;


--
-- Name: tyre_stints fk_tyre_stints_session_id_sessions; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tyre_stints
    ADD CONSTRAINT fk_tyre_stints_session_id_sessions FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 43uasGQnkJfb6WIwbr3QK94xw9JH6EWdq678799bXpbjtA5gyVC2wWyDjKNb5mJ

