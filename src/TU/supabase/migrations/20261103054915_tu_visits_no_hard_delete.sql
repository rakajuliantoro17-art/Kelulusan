-- Visitor records are retained through status cancellation; no hard-delete API exists.
revoke delete on tu.visits from service_role;
