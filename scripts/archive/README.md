# Closing Beswib: what the code does not deploy

PocketBase keeps its API rules and its records in its own database. The repository has no
`pb_migrations`, and the container only mounts `pb_data` and `pb_hooks`: a migration file committed
here would never run. The two scripts below are run by hand, from any machine, against the base they
are pointed at. They need a superuser token in `PB_SUPERUSER_TOKEN`, which they never print
(PocketBase dashboard `/_/` > Collections > `_superusers` > a record > Impersonate).

Without `--apply` they only read.

## 1. API rules of `verifiedEmails`

```sh
node scripts/archive/lock-verified-emails.mjs --url https://<base>            # prints the rules
node scripts/archive/lock-verified-emails.mjs --url https://<base> --apply    # listRule, viewRule
node scripts/archive/lock-verified-emails.mjs --url https://<base> --apply --all-rules
```

The script reads the collection back, then checks that a read without the token is refused. The same
by hand: dashboard `/_/` > Collections > `verifiedEmails` > API Rules > set the rule to the locked
state (superuser only). Or:

```sh
curl -X PATCH https://<base>/api/collections/verifiedEmails \
  -H "Authorization: $PB_SUPERUSER_TOKEN" -H 'Content-Type: application/json' \
  -d '{"listRule":null,"viewRule":null}'
```

The app is not affected: it only reaches this collection from the server, with the superuser token.

## 2. Fictional data

**Destructive.** Deletes every record of `transactions`, `waitlists`, `bibs`, `verifiedEmails`,
`paypalAPI`, `eventCreationRequests`, `users`, `events` and `organizer`, with their files, then creates
fictional ones (`scripts/archive/fictional-data.mjs`). `articles`, `seo`, `image_with_alt` and the
superusers are left alone.

Order:

1. Deploy the code of this branch, so that nothing can start a payment or a listing during the run.
2. Back up: dashboard `/_/` > Settings > Backups > New backup, then **download the .zip and keep it off
   the server**. A backup left in `pb_data/backups` still holds the real data on the same disk.
3. Dry run, which checks the fictional data and the relations against the schema of this base and
   prints the counts:
   `node scripts/archive/seed-fictional-data.mjs --url https://<base>`
4. Run:
   `node scripts/archive/seed-fictional-data.mjs --url https://<base> --apply --confirm-host <host> --backup <name>`
   (`--backup` must name a backup of this base less than 24 hours old; `--backup-file <path>` takes the
   downloaded .zip instead.)

If it stops halfway, it can be run again: it starts by deleting. To undo: dashboard > Settings >
Backups > Restore.

The events are dated 12 to 34 months after the run, and the site hides a listing once its transfer
deadline has passed. Running the script again moves them forward.

## After the run

Still holding real data after the script, none of which it can reach:

- Clerk: the accounts. Delete them, and turn sign-ups off, or the Clerk webhook creates a real `users`
  record for the next person who signs up.
- PocketBase: `pb_data/auxiliary.db` (request logs: dashboard > Settings > Logs, retention 0) and the
  free pages of `pb_data/data.db` until a `VACUUM`, which needs access to the server.
- The backups, on purpose. Decide how long to keep them, and delete them after that.
- Umami: the session properties sent by the versions before v1.2.0.
- Sentry, Resend and PayPal: their own history.
