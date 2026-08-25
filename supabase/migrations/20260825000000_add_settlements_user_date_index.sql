create index if not exists settlements_user_date_sheet_idx
on public.settlements (user_id, date desc, sheet_id asc);
