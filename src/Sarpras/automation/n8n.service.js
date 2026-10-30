await n8nService.execute(
    "backup",
    payload
);

await n8nService.execute(
    "maintenance",
    payload
);

await n8nService.execute(
    "daily-report",
    payload
);
