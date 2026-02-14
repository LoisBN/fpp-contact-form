import { Form } from "react-router";

// TODO: Import Route type from generated types
// import type { Route } from "./+types/home";

// TODO: Create an action function to handle form submissions
// export async function action({ request }: Route.ActionArgs) {
//   const formData = await request.formData();
//   // Validate and save to Supabase
//   return { success: true };
// }

export default function Home(/*{ actionData }: Route.ComponentProps*/) {
  // TODO: Use actionData to show success/error messages

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
      <p className="text-gray-600 mb-6">Learn React Router actions by building a contact form.</p>

      {/* TODO: Use the Form component from react-router (uses action automatically) */}
      <Form method="post" className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            name="message"
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Your message..."
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium"
        >
          Send Message
        </button>
      </Form>
    </div>
  );
}
