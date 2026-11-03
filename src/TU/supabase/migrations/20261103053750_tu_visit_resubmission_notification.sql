-- Notify the destination unit when Front Office submits requested clarification.
create or replace function tu.handle_visit_workflow()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare
  v_actor uuid;
  v_front_office_id uuid;
  v_event text;
begin
  v_actor := coalesce(new.updated_by, new.created_by);
  select id into v_front_office_id from tu.units where unit_code = 'front_office' and is_active;
  if tg_op = 'INSERT' then
    insert into tu.visit_events(visit_id, actor_id, event_type, from_status, to_status, event_note)
    values (new.id, v_actor, 'registered', null, new.status, null);
    insert into tu.visit_notifications(recipient_unit_id, notification_type, title, body, target_path, entity_type, entity_id, priority)
    values (new.destination_unit_id, 'visit_approval_needed', 'Permintaan kunjungan baru',
      'Ada permintaan kunjungan yang menunggu respons unit. Buka Front Office untuk melihat detail.',
      '/tata-usaha/front-office', 'visit', new.id, 'normal');
    return new;
  end if;
  if new.status is distinct from old.status then
    v_event := case new.status
      when 'approved' then 'approved'
      when 'clarification_requested' then 'clarification_requested'
      when 'rejected' then 'rejected'
      when 'checked_in' then 'checked_in'
      when 'completed' then 'completed'
      when 'cancelled' then 'cancelled'
      when 'pending_unit' then 'resubmitted'
      else 'registered'
    end;
    insert into tu.visit_events(visit_id, actor_id, event_type, from_status, to_status, event_note)
    values (new.id, v_actor, v_event, old.status, new.status, new.status_note);
    if new.status = 'pending_unit' then
      insert into tu.visit_notifications(recipient_unit_id, notification_type, title, body, target_path, entity_type, entity_id, priority)
      values (new.destination_unit_id, 'visit_approval_needed', 'Klarifikasi kunjungan telah dikirim',
        'Front Office telah mengirim klarifikasi. Permintaan kunjungan menunggu respons unit.',
        '/tata-usaha/front-office', 'visit', new.id, 'high');
    elsif new.status in ('approved','clarification_requested','rejected','completed','cancelled') and v_front_office_id is not null then
      insert into tu.visit_notifications(recipient_unit_id, notification_type, title, body, target_path, entity_type, entity_id, priority)
      values (
        v_front_office_id,
        case new.status when 'approved' then 'visit_approved'
          when 'clarification_requested' then 'visit_approval_needed'
          when 'rejected' then 'visit_rejected' else 'system_notice' end,
        case new.status when 'approved' then 'Kunjungan disetujui unit tujuan'
          when 'clarification_requested' then 'Unit tujuan meminta klarifikasi'
          when 'rejected' then 'Permintaan kunjungan ditolak'
          when 'completed' then 'Kunjungan telah selesai' else 'Status kunjungan diperbarui' end,
        'Status permintaan kunjungan berubah. Buka Front Office untuk melihat tindak lanjut.',
        '/tata-usaha/front-office', 'visit', new.id,
        case when new.status in ('rejected','clarification_requested') then 'high' else 'normal' end
      );
    elsif new.status = 'checked_in' then
      insert into tu.visit_notifications(recipient_unit_id, notification_type, title, body, target_path, entity_type, entity_id, priority)
      values (new.destination_unit_id, 'visitor_arrived', 'Tamu telah tiba',
        'Petugas Front Office telah mencatat kedatangan tamu untuk unit Anda.',
        '/tata-usaha/front-office', 'visit', new.id, 'normal');
    end if;
  end if;
  return new;
end;
$$;
