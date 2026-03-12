# Contact Form — React Router Actions

Build a contact form using React Router v7 actions for server-side form handling and validation.

## What You'll Learn

- Action functions in React Router v7
- The `<Form>` component for submitting data
- Parsing `formData` from requests
- `actionData` for displaying success/error feedback
- Form validation patterns

## Tech Stack

- **React Router v7** (framework mode) — pages and routing
- **Supabase** — database and auth
- **Tailwind CSS v4** — styling
- **TypeScript** — type-safe JavaScript

---

## Exercise: Step-by-Step Instructions

> **Read each step carefully.** We tell you exactly _where_ to do each thing — your VSCode terminal, the Supabase dashboard, a specific file, or Claude.

---

### Step 1: Clone the repository

> 📍 **Where:** Your VSCode terminal (`` Ctrl + ` `` to open it)

```bash
cd ~/Desktop
git clone https://github.com/LoisBN/fpp-contact-form.git
cd fpp-contact-form
code .
```

---

### Step 2: Install dependencies

> 📍 **Where:** Your VSCode terminal

```bash
npm install
```

---

### Step 3: Set up your environment file

> 📍 **Where:** Your VSCode terminal

**On Mac/Linux:**
```bash
cp .env.example .env
```

**On Windows (Command Prompt):**
```bash
copy .env.example .env
```

**On Windows (PowerShell):**
```bash
Copy-Item .env.example .env
```

> 📍 **Where:** VSCode — open the `.env` file

Replace the placeholder values with your Supabase credentials:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> 💡 **Where do I find these?** Supabase dashboard → your project → **Settings** (gear icon) → **API**. Copy "Project URL" and the "anon public" key.

---

### Step 4: Create the messages table in Supabase

> 📍 **Where:** Your browser — Supabase Dashboard → SQL Editor

Go to your Supabase project, click **SQL Editor**, click **New Query**, and paste this:

```sql
CREATE TABLE messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz default now()
);
```

Click **"Run"**. You should see a green success message.

> 💡 **What just happened?** You created a `messages` table where contact form submissions will be stored. Each message has a name, email, message body, and a timestamp.

---

### Step 5: Start the app

> 📍 **Where:** Your VSCode terminal

```bash
npm run dev
```

> 📍 **Where:** Your browser

Open [http://localhost:5173](http://localhost:5173). You should see a contact form page.

---

### Step 6: Write the action function

> 📍 **Where:** VSCode — open `app/routes/home.tsx`

Find this file: `app` → `routes` → `home.tsx`. Or press `Ctrl+P` / `Cmd+P` and type `home.tsx`.

**What is an action?** In React Router v7, an _action_ handles form submissions. When someone fills out the form and clicks "Submit", the action function runs on the server, processes the data, and returns a result.

Your job is to:

1. **Parse the form data** — Get the name, email, and message from the submitted form
2. **Validate the input** — Check that all fields are filled in and the email looks valid
3. **Insert into Supabase** — Save the message to the `messages` table
4. **Return feedback** — Send back a success or error message to show the user

> 💡 **Ask Claude!** Try: *"I need to write a React Router v7 action function that reads name, email, and message from a form submission, validates them, and inserts them into a Supabase table called 'messages'. Show me the full action function."*

---

### Step 7: Show success/error feedback

> 📍 **Where:** VSCode — still in `app/routes/home.tsx`

After the action runs, you need to show the user whether their message was sent successfully or if there was an error. React Router gives you `actionData` for this.

> 💡 **Ask Claude!** Try: *"How do I use actionData in React Router v7 to show a success message after a form submission?"*

---

### Step 8: Test your work

> 📍 **Where:** Your browser — [http://localhost:5173](http://localhost:5173)

1. Fill out the contact form with a name, email, and message
2. Click "Submit"
3. You should see a success message appear on the page

> 📍 **Where:** Supabase Dashboard → Table Editor → `messages` table

Check the `messages` table — your submitted message should appear as a new row!

**Also test validation:**
- Try submitting with an empty name — you should see an error
- Try submitting with an invalid email (like "notanemail") — you should see an error

---

### Step 9: Commit and push your work

> 📍 **Where:** Your VSCode terminal

```bash
git add .
git commit -m "Implement contact form with validation"
git push
```

---

## Ask Claude for Help

- **"What's the difference between a loader and an action in React Router?"** — Loaders fetch data, actions handle form submissions
- **"How do I parse formData in a React Router action?"**
- **"How do I validate an email address in JavaScript?"**
- **"How do I show an error message conditionally in React?"**
- **"I'm getting this error: [paste error]. What's wrong?"**

---

## Project Structure

```
app/
├── routes/
│   └── home.tsx          ← ⭐ CONTACT FORM — write the action here!
└── lib/
    └── supabase.ts       ← Supabase client setup (no need to edit)
```

---

## Troubleshooting

**Form submits but nothing happens:**
- Make sure you're using `<Form method="post">` from `react-router` (not a regular HTML `<form>`)
- Check the browser console (`F12` → Console) for errors

**"relation 'messages' does not exist":**
- You haven't created the table yet — go back to Step 4

**Validation isn't working:**
- Make sure your action returns an object like `{ error: "Name is required" }` when validation fails
- Make sure your component checks `actionData?.error` and displays it

**"npm install" fails:**
- Make sure you have Node.js version 18+ installed. Check with `node --version`

---

Built for [AI Code Academy](https://aicode-academy.com) — From Prompt to Production course.
