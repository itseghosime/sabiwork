# Screen-to-route ownership

Canonical starting route map for the shared foundation. It supersedes the earlier approximate route suggestions in IMPLEMENTATION.md. Agree changes before dependent work. Detail views and state variants may reuse the same route/component rather than create a page per screenshot. S17 includes a selected-request detail view; S26 includes transaction detail linked to its payment reference; S48 uses the framework not-found convention.

| Screen | Route / implementation | Frontend owner |
|---|---|---|
| S01 | `/` | Abdulrahman Itseghosime Bello |
| S02 | `/categories` | Abdulrahman Itseghosime Bello |
| S03 | `/artisans` | Abdulrahman Itseghosime Bello |
| S04 | `/artisans/[id]` | Uduehi Emmanuel |
| S05 | `/artisans/[id]/portfolio/[photoId]` | Uduehi Emmanuel |
| S06 | `/artisan/profile` | Uduehi Emmanuel |
| S07 | `/signup/customer` | Natalie Ekun Omokhafue |
| S08 | `/signup/artisan` | Amuele Sophia Ifeanyi |
| S09 | `/login` | Natalie Ekun Omokhafue |
| S10 | `/verify-email` | Natalie Ekun Omokhafue |
| S11 | `/forgot-password` | Natalie Ekun Omokhafue |
| S12 | `/reset-password` | Natalie Ekun Omokhafue |
| S13 | `/settings` | Obiekwe Chioma Benedicta |
| S14 | `/requests/new` | Abigail Oghogho Igbinomwanhia |
| S15 | `/requests/new/review` | Abigail Oghogho Igbinomwanhia |
| S16 | `/requests/[id]` | Abigail Oghogho Igbinomwanhia |
| S17 | `/artisan/requests` | Abigail Oghogho Igbinomwanhia |
| S18 | `/artisan/requests/[id]/quote` | Abigail Oghogho Igbinomwanhia |
| S19 | `/requests/[id]/quotes` | George Elueze |
| S20 | `/quotes/[id]` | George Elueze |
| S21 | `/jobs/[id]/payments/deposit` | George Elueze |
| S22 | `/payments/[reference]/verify` | Amuele Sophia Ifeanyi |
| S23 | `/payments/[reference]/receipt` | Amuele Sophia Ifeanyi |
| S24 | `/payments/[reference]/failed` | George Elueze |
| S25 | `/jobs/[id]/payments/balance` | George Elueze |
| S26 | `/payments` | Godswill Silvanus |
| S27 | `/jobs` | Godswill Silvanus |
| S28 | `/jobs/[id]` | Godswill Silvanus |
| S29 | `/artisan/jobs/[id]/progress` | Godswill Silvanus |
| S30 | `/jobs/[id]/complete` | Godswill Silvanus |
| S31 | `/jobs/[id]/review` | Mohammed Usman |
| S32 | `/jobs/[id]/dispute` | Mohammed Usman |
| S33 | `/disputes/[id]` | Mohammed Usman |
| S34 | `/admin/disputes` | Mohammed Usman |
| S35 | `/admin/disputes/[id]` | Mohammed Usman |
| S36 | `/artisan` | Chukwu Chikodili Rachel |
| S37 | `/artisan/jobs` | Chukwu Chikodili Rachel |
| S38 | `/artisan/earnings` | Chukwu Chikodili Rachel |
| S39 | `/artisan/availability` | Chukwu Chikodili Rachel |
| S40 | `/artisan/verification` | Uduehi Emmanuel |
| S41 | `/artisan/verification/status` | Uduehi Emmanuel |
| S42 | `/admin/verification` | Amuele Sophia Ifeanyi |
| S43 | `/admin/verification/[id]` | Amuele Sophia Ifeanyi |
| S44 | `/training` | Obiekwe Chioma Benedicta |
| S45 | `/training/[id]` | Obiekwe Chioma Benedicta |
| S46 | `/training/[id]/certificate` | Obiekwe Chioma Benedicta |
| S47 | `/forbidden` | Abdulrahman Itseghosime Bello |
| S48 | `Next.js not-found.tsx (not a /404 page)` | Abdulrahman Itseghosime Bello |
