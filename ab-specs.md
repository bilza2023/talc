
## ✅ SYSTEM SPEC V1: EVENT-CENTRIC OPS PLATFORM

---

### 1. **Users Can Be Added**

I. `users` table with fields:
 – `id`, `name`, `email`, `password_hash`, `role`, `status`

II. Supported user roles:
 – `super_admin` (system-wide)
 – `event_supervisor` (per-event)
 – `event_manager` (per-event)
 – (Optional: `event_agent`, `viewer`, etc.)

III. User → Event assignment handled via `event_assignments`

---

### 2. **Events Can Be Added and Assigned Metadata**

Each `event` has:

I. `id`, `title`, `description`
II. `category` (single)
III. `tags[]` (multi)
IV. `supervisor_id` (FK → users)
V. `manager_id` (FK → users)
VI. `table_name` (for event data)
VII. `form_schema` (optional)
VIII. `status`, `created_at`, `created_by_user_id`

---

### 3. **App Has One Built-in Super User**

#### Purpose:

I. Bootstrap control
II. Has access to:
 – All events
 – All messages
 – All users
 – Can create/delete any entity

#### Implementation:

I. Stored in `users` table
II. `role = 'super_admin'`
III. System enforces only **one** active super user

#### Optional Enhancements:

– `is_builtin` flag → to lock editing/deletion
– CLI-only creation path (not in UI)

> 🔐 The super admin is the system **root** — must be present for total control.

---

### 4. **Each Event Has 1 Table, 1 Form, 1 Dashboard**

I. **Table**
 – Named like `event_<event_id>_data`
 – Created at event creation time (manual for now)
 – Schema = event-specific

II. **Form**
 – Stored as a JSON schema in `event.form_schema`
 – Used to render dynamic forms for data entry
 – Fields map to columns in event table

III. **Dashboard**
 – Displays stats, graphs, recent submissions
 – Reads from `event_<id>_data`
 – Role-based access

---

### 5. **Each Event Trigger Generates a Message**

#### Triggers may include:

I. New submission
II. Data update or flag
III. Status change
IV. Manual alert

#### Message Model:

I. `id`, `event_id`, `text`, `trigger_type`, `created_at`, `created_by`
II. `priority` (e.g., info, warning, critical)

#### Visibility Rules:

| Role        | Sees Which Messages              |
| ----------- | -------------------------------- |
| Super Admin | All messages                     |
| Supervisor  | Only messages for their event(s) |
| Manager     | Only messages for their event(s) |

#### Inbox Logic:

– Query `messages` WHERE `event_id IN (assigned events)`
– Filter by role/view privileges

---

## ✅ Summary View (System Map)

| Object        | Key Attributes/Functions                    |
| ------------- | ------------------------------------------- |
| `users`       | All actors in the system                    |
| `events`      | Core entity — drives table, form, dashboard |
| `assignments` | Maps users to events + roles                |
| `tables`      | One per event; stores form data             |
| `forms`       | Defined per event; used for input UI        |
| `dashboards`  | Visual layer per event                      |
| `messages`    | Log of all important actions                |
| `super_admin` | Root access; full control                   |

---
Yes — confirmed and agreed.

Here’s the clean design for **User Dashboards**:

---

## ✅ USER DASHBOARD DESIGN (PER ROLE)

---

### 1. **All Users Have Their Own Dashboard**

Each user, upon login, is routed to their **personal dashboard**, based on role.

---

### 2. **Dashboard Contents:**

#### For Regular Users (Supervisors, Managers):

**Section A: Assigned Events**

I. List of all `events` where:
 – `user_id = current_user`
 – via role as `supervisor` or `manager`

II. Each entry shows:
 – Event name, status
 – Last updated
 – Shortcut to: `form`, `dashboard`, `messages`

---

**Section B: Messages Feed**

I. Shows messages where:
 – `event_id` is one of the user’s assigned events
 – Ordered by `created_at` DESC
 – Filterable by event, priority, type

---

**Section C (Optional):** Quick Actions
– Submit new entry
– View flagged submissions
– View unread messages

---

### 3. **Super Admin Dashboard**

#### Same as regular user **PLUS**:

**Section A: System-wide Event Overview**

I. Table of all events
 – Status, owner, created\_at
 – Links to each event’s dashboard

---

**Section B: Global Messages Feed**

I. All messages from all events
 – Ordered by time
 – Filter by event, priority, user

---

**Section C: Admin Controls**

I. Add/edit users
II. Add/edit events
III. Monitor system stats
IV. Perform bulk actions (e.g. archive, notify)

---

## ✅ Summary

| Role        | Dashboard Shows What                           |
| ----------- | ---------------------------------------------- |
| Supervisor  | Their assigned events + related messages       |
| Manager     | Their assigned events + related messages       |
| Super Admin | All events + all messages + full control tools |

---
rough top level modules draft 1 
1. Correct. You're identifying **redundancies vs actual core entities**. Let's cleanly distinguish:

---

## ✅ FINALIZED TOP-LEVEL **CORE OBJECTS ONLY**

These are **real system entities**, not views or subcomponents.

### I. `User`

– Represents any person with access (super admin, supervisor, manager)

### II. `Event`

– The central unit: owns form, table, dashboard, messages

### III. `FormSchema`

– Defines the structure of the form for an event
– Stored inside the event (but logically separate)

### IV. `EventDataTable`

– Physical SQL table storing submitted form entries per event

### V. `Message`

– Triggered by activity inside an event
– Routed to relevant users

---

## 🔸 Non-Core (Views or Derived Constructs)

– `SuperAdmin` → **user with special privileges**, not a separate object
– `UserHome` → **view/page**, not an entity
– `Dashboard` → **attached to each event**, not its own system object

---

## ✅ Final Clean Core Object List (True System Entities)

1. `User`
2. `Event`
    a. `Form`
    b. `Dashboard`
4. `Central Events Table`
5. `Messages Module`

This is your true data model foundation. Locked unless overridden. Ready for structure or flows.
