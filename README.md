# Contact Form — React Router Actions

Build a contact form using React Router v7 actions for server-side form handling and validation.

## What You'll Learn
- Action functions in React Router v7
- Form component for submitting data
- Parsing formData from requests
- actionData for displaying feedback
- Form validation patterns
- Success/error messaging

## Tech Stack
- **React Router v7** (framework mode) — pages and routing
- **Supabase** — database and auth
- **Tailwind CSS v4** — styling
- **TypeScript** — type-safe JavaScript

## Getting Started

```bash
# 1. Clone this repo
git clone https://github.com/LoisBN/fpp-contact-form.git
cd fpp-contact-form

# 2. Install dependencies
npm install

# 3. Copy the environment file
cp .env.example .env
# Add your Supabase URL and anon key to .env

# 4. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see the app.

## Project Structure

```
fpp-contact-form/
├── app/
│   ├── routes/
│   │   ├── home.tsx          # Contact form with action
│   │   └── routes.ts         # Route definitions
│   └── lib/
│       └── supabase.ts       # Supabase client setup
├── .env.example
├── package.json
└── README.md
```

## Exercise Tasks

1. **Create messages table** — Add columns: id, name, email, message, created_at
2. **Write action function** — Handle POST requests and insert messages into database
3. **Add validation** — Check for required fields and valid email format
4. **Show feedback** — Use actionData to display success/error messages
5. **Display messages** — Show submitted messages in a list (optional admin view)

## Hints

- Use `<Form method="post">` from react-router (not HTML form element)
- Action signature: `export async function action({ request }: Route.ActionArgs)`
- Parse form data: `const formData = await request.formData()`
- Return success/error object: `{ success: true }` or `{ error: "Invalid email" }`
- Access in component: `const actionData = useActionData<typeof action>()`
- Validate email with regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

---

Built for [AI Code Academy](https://aicode-academy.com) — From Prompt to Production course.
