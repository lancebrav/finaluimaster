# Project Flowchart

Below is a high-level program flowchart (Mermaid) for the codebase. Open this file in VS Code to render the diagram.

```mermaid
flowchart LR
  subgraph Browser
    U[User] -->|visits| LoginPage[pages/login.html]
    U -->|visits| HomePage[pages/home.html]
    U -->|visits| ResidentServices[pages/resident-services.html]
    U -->|visits| Announcements[pages/resident-announcements.html]
  end

  LoginPage -->|POST JSON| LoginPHP[php/login.php]
  LoginPHP --> DB[php/db.php]
  LoginPHP -->|on success admin| AdminDash[admin/admin-dashboard.php]
  LoginPHP -->|on success resident| HomePage

  ResidentServices -->|POST JSON| AddRequest[php/add_document_request.php]
  AddRequest --> DB
  AddRequest --> SendEmail[php/send_submission_email.php]

  AdminDash -->|loads| GetRequests[php/get_document_requests.php]
  GetRequests --> UpdateStatus[php/update_document_request_status.php]
  GetRequests --> ArchiveReq[php/archive_document_request.php]

  AdminDash -->|manage| GetResidents[php/get_residents.php]
  GetResidents --> AddResident[php/add_resident.php]
  GetResidents --> EditResident[php/edit_resident.php]
  GetResidents --> ArchiveResident[php/archive_resident.php]

  AdminDash -->|announcements| GetAnnouncements[php/get_announcements.php]
  GetAnnouncements --> AddAnnouncement[php/add_announcement.php]
  GetAnnouncements --> ArchiveAnnouncement[php/archive_announcement.php]

  subgraph Utilities
    ProtectAdmin[php/protect_admin.php]
    RequireAdminAPI[php/require_admin_api.php]
    SessionCheck[php/session_check.php]
    HashUtil[php/hash.php]
    DBConn[php/db.php]
  end

  AdminDash --> ProtectAdmin
  LoginPHP --> SessionCheck

  %% Legend
  classDef grey fill:#f3f4f6,stroke:#ddd
  class DB,DBConn grey

``` 

**Notes:**
- This diagram is intentionally high-level. It highlights primary web pages and corresponding PHP endpoints (auth, resident management, document requests, announcements).
- If you want a PNG/SVG export, or a more detailed sub-flow for any area (authentication, document request lifecycle, admin-resident CRUD), tell me which area to expand.
