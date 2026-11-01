# Closing Beswib: what the code does not deploy

PocketBase keeps its API rules and its records in its own database. The repository has no
`pb_migrations`, and the container only mounts `pb_data` and `pb_hooks`: a migration file committed
here would never run. The two scripts below are run by hand, from any machine, against the base they
are pointed at. They need a superuser token in `PB_SUPERUSER_TOKEN`, which they never print
(PocketBase dashboard `/_/` > Collections > `_superusers` > a record > Impersonate).

Without `--apply` they only read.

## 1. API rules of a collection

```sh
node scripts/archive/set-collection-rules.mjs --url https://<base> --collection <name>            # prints the rules
node scripts/archive/set-collection-rules.mjs --url https://<base> --collection <name> --apply    # listRule, viewRule
node scripts/archive/set-collection-rules.mjs --url https://<base> --collection <name> --apply --all-rules
```

The script reads the collection back, then does the same read without the token and expects a refusal.
The same by hand: dashboard `/_/` > Collections > the collection > API Rules.

The app only reaches PocketBase from the server, with the superuser token: its pages do not depend on
these rules.

## 2. Fictional data

**Destructive.** Deletes every record of `transactions`, `waitlists`, `bibs`, `verifiedEmails`,
`paypalAPI`, `eventCreationRequests`, `users`, `events` and `organizer`, with their files, then creates
fictional ones (`scripts/archive/fictional-data.mjs`). `articles`, `seo`, `image_with_alt` and the
superusers are left alone.

Order:

1. Deploy the code of this branch with `NEXT_PUBLIC_ARCHIVE_DATA_FICTIONAL` unset. Payments, listings,
   the waitlist, event requests and sign-ups are closed, and the Clerk webhook writes nobody: nothing
   adds a real person during the run. The site does not call its data fictional yet.
2. Back up: dashboard `/_/` > Settings > Backups > New backup, then **download the .zip and keep it off
   the server**. A backup left in `pb_data/backups` still holds the real data on the same disk.
3. Dry run, which checks the fictional data and the relations against the schema of this base, with
   the rules PocketBase applies (empty required values, pattern, min, max), and prints the counts:
   `node scripts/archive/seed-fictional-data.mjs --url https://<base>`
4. Run:
   `node scripts/archive/seed-fictional-data.mjs --url https://<base> --apply --confirm-host <host> --backup-file <downloaded .zip>`
   The file must be a .zip that holds a `data.db`, downloaded less than 24 hours ago. Nothing in it says
   which base it comes from: pass the right one.
5. Set `NEXT_PUBLIC_ARCHIVE_DATA_FICTIONAL=true` for this site and rebuild it (a redeploy, not a restart:
   Next.js writes the value in at build time). The site now says its data is fictional.

If it stops halfway, it can be run again: it starts by deleting. To undo: dashboard > Settings >
Backups > Restore.

The events are dated 12 to 34 months after the run, and the site hides a listing once its transfer
deadline has passed. Running the script again moves them forward.

## After the run

Sign-ups are closed in the code, so none of this is urgent, and none of it is within reach of the script.

Still holding real data:

- Clerk: the accounts. Turn sign-ups off in its dashboard (an API call could still create an account
  there, which the webhook now ignores), then delete them.
- PocketBase: `pb_data/auxiliary.db` (request logs: dashboard > Settings > Logs, retention 0) and the
  free pages of `pb_data/data.db` until a `VACUUM`, which needs access to the server.
- The backups, on purpose. Decide how long to keep them, and delete them after that.
- Umami: the session properties sent by the versions before v1.2.0.
- Sentry, Resend and PayPal: their own history.
