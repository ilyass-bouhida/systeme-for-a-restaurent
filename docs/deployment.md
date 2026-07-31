# Deployment Notes

Production needs:

- PHP 8.3+
- MySQL 8.0+
- a queue worker
- Laravel Reverb
- HTTPS
- a built React frontend

Set backend secrets only in the server environment. Configure
`FRONTEND_URL`, MySQL credentials, Sanctum trusted origins, Reverb credentials,
and hardware driver choices. Never commit `.env`.

The frontend receives only:

- `VITE_API_URL`
- public Reverb host, port, scheme, and app key

Run database migrations before starting workers. Use a process supervisor for
the HTTP server, queue worker, and Reverb. The mock hardware drivers are safe for
staging; bind real adapters only on the restaurant network.
