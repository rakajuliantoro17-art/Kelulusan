-- PINTUKU HUMAS Sprint 5 — Tracer Study analytics.
-- Aggregated reporting only; no personal contact fields are returned.

create or replace function humas.alumni_analytics(
  p_graduation_year integer default null,
  p_survey_year integer default null
)
returns jsonb
language sql
stable
set search_path=''
as $$
with filtered as (
  select
    graduation_year,
    survey_year,
    current_status,
    institution,
    industry,
    province,
    city,
    whatsapp,
    email
  from humas.alumni_profiles
  where record_status='active'
    and (p_graduation_year is null or graduation_year=p_graduation_year)
    and (p_survey_year is null or survey_year=p_survey_year)
),
summary as (
  select
    count(*)::bigint as total,
    count(*) filter (where survey_year is not null)::bigint as surveyed,
    count(*) filter (where current_status='studying')::bigint as studying,
    count(*) filter (where current_status='employed')::bigint as employed,
    count(*) filter (where current_status='entrepreneur')::bigint as entrepreneur,
    count(*) filter (where current_status='seeking_work')::bigint as seeking_work,
    count(*) filter (where current_status='other')::bigint as other,
    count(*) filter (where current_status='not_reported')::bigint as not_reported
  from filtered
),
status_rows as (
  select current_status as status,count(*)::bigint as total
  from filtered group by current_status
),
cohort_rows as (
  select graduation_year as year,count(*)::bigint as total,
    count(*) filter (where survey_year is not null)::bigint as surveyed
  from filtered group by graduation_year
),
survey_rows as (
  select survey_year as year,count(*)::bigint as total,
    count(*) filter (where current_status='studying')::bigint as studying,
    count(*) filter (where current_status='employed')::bigint as employed,
    count(*) filter (where current_status='entrepreneur')::bigint as entrepreneur,
    count(*) filter (where current_status='seeking_work')::bigint as seeking_work,
    count(*) filter (where current_status='other')::bigint as other,
    count(*) filter (where current_status='not_reported')::bigint as not_reported
  from filtered where survey_year is not null group by survey_year
),
institution_rows as (
  select institution as label,count(*)::bigint as total
  from filtered where nullif(btrim(institution),'') is not null
  group by institution order by total desc,institution asc limit 8
),
industry_rows as (
  select industry as label,count(*)::bigint as total
  from filtered where nullif(btrim(industry),'') is not null
  group by industry order by total desc,industry asc limit 8
),
province_rows as (
  select province as label,count(*)::bigint as total
  from filtered where nullif(btrim(province),'') is not null
  group by province order by total desc,province asc limit 8
),
quality as (
  select
    count(*) filter (where nullif(btrim(coalesce(whatsapp,'')),'') is null and nullif(btrim(coalesce(email,'')),'') is null)::bigint as missing_contact,
    count(*) filter (where nullif(btrim(coalesce(city,'')),'') is null and nullif(btrim(coalesce(province,'')),'') is null)::bigint as missing_domicile,
    count(*) filter (where current_status='not_reported')::bigint as status_not_reported
  from filtered
)
select jsonb_build_object(
  'summary',jsonb_build_object(
    'total',(select total from summary),
    'surveyed',(select surveyed from summary),
    'coverage_percent',case when (select total from summary)=0 then 0
      else round(100.0*(select surveyed from summary)/nullif((select total from summary),0),1) end,
    'studying',(select studying from summary),
    'employed',(select employed from summary),
    'entrepreneur',(select entrepreneur from summary),
    'seeking_work',(select seeking_work from summary),
    'other',(select other from summary),
    'not_reported',(select not_reported from summary)
  ),
  'by_status',coalesce((select jsonb_agg(jsonb_build_object('status',status,'total',total) order by total desc,status) from status_rows),'[]'::jsonb),
  'by_cohort',coalesce((select jsonb_agg(jsonb_build_object('year',year,'total',total,'surveyed',surveyed,
    'coverage_percent',case when total=0 then 0 else round(100.0*surveyed/nullif(total,0),1) end) order by year desc) from cohort_rows),'[]'::jsonb),
  'by_survey_year',coalesce((select jsonb_agg(jsonb_build_object('year',year,'total',total,'studying',studying,
    'employed',employed,'entrepreneur',entrepreneur,'seeking_work',seeking_work,'other',other,'not_reported',not_reported) order by year desc) from survey_rows),'[]'::jsonb),
  'top_institutions',coalesce((select jsonb_agg(jsonb_build_object('label',label,'total',total) order by total desc,label) from institution_rows),'[]'::jsonb),
  'top_industries',coalesce((select jsonb_agg(jsonb_build_object('label',label,'total',total) order by total desc,label) from industry_rows),'[]'::jsonb),
  'top_provinces',coalesce((select jsonb_agg(jsonb_build_object('label',label,'total',total) order by total desc,label) from province_rows),'[]'::jsonb),
  'data_quality',(select jsonb_build_object('missing_contact',missing_contact,'missing_domicile',missing_domicile,'status_not_reported',status_not_reported) from quality)
);
$$;

revoke all on function humas.alumni_analytics(integer,integer) from public,anon,authenticated;
grant execute on function humas.alumni_analytics(integer,integer) to service_role;
