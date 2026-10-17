# Account types

The system defines **seven account roles**: five non-administrative roles and two
administrative roles.

| Account type | Backend role |
| --- | --- |
| Super Admin | `SUPER_ADMIN` |
| Admin | `ADMIN` |
| Nodal Organization | `NO` |
| Affiliated Organization | `AO` |
| Village Level Entrepreneur | `VLE` |
| Innovator | `INNOVATOR` |
| General User | `GENERAL_USER` |

The source of truth is the role enum in the [User model](../InnovationGuildBackend-main/src/models/User.js).
The [frontend role mapping](../InnovationGuild-main/src/utils/constants/roles.js)
maps the five non-administrative roles to registration/navigation URLs.

## Authentication and account state

- Account role and authentication method are separate concepts. Google, email/password,
  and phone-based authentication do not add more account roles.
- The Google controller accepts `VLE`, `INNOVATOR`, `AO`, `NO`, and `GENERAL_USER`.
  It does not accept the two administrative roles as Google registration parameters.
- The Google login path rejects an unknown account and directs the user to register.
- The Google strategy rejects Google sign-in for an already verified password-only
  account. Automatic linking for those accounts is not currently implemented.
- Account statuses are `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`, and `BANNED`.
  These are account states, not additional account types.

See the [Google controller](../InnovationGuildBackend-main/src/api/controllers/auth/googleController.js)
and [Google strategy](../InnovationGuildBackend-main/src/config/passport.js).

## Migration checks still required

Preserve role values and account statuses when migrating users. Include representative
accounts for all seven roles in post-migration access checks. This review establishes
the role list; it does not establish live account counts or a complete permission matrix.
